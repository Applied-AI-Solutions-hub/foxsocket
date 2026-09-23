param([Parameter(Mandatory=$true)][string]$AppPath)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'host-prerequisites.ps1')
# NSIS is a 32-bit process even for an x64 app. Escape filesystem redirection
# before looking for wsl.exe or querying the per-user AppX packages.
if ([Environment]::Is64BitOperatingSystem -and ![Environment]::Is64BitProcess) {
    $nativePowerShell = Join-Path $env:SystemRoot 'Sysnative\WindowsPowerShell\v1.0\powershell.exe'
    $command = Get-HostSetupResumeCommand $nativePowerShell $PSCommandPath $AppPath
    $arguments = $command.Substring($nativePowerShell.Length + 3)
    Start-Process -FilePath $nativePowerShell -ArgumentList $arguments -WindowStyle Hidden -Wait
    exit 0
}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

# Keep distro registration in the installing user's account. Elevate only the
# fixed, system-wide WSL installation command, never this script or saved state.
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$mutex = New-Object Threading.Mutex($false, ('Local\FoxsocketHostSetup-' + $identity.User.Value))
if (!$mutex.WaitOne(0)) { exit 0 }
$setupDir = Join-Path $env:LOCALAPPDATA 'Foxsocket\HostSetup'
$stateFile = Join-Path $setupDir 'progress.json'
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$powerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$wsl = Join-Path $env:SystemRoot 'System32\wsl.exe'
if (!(Test-Path -LiteralPath $AppPath)) {
    Remove-ItemProperty -Path $runKey -Name 'FoxsocketHostSetup' -ErrorAction SilentlyContinue
    [Windows.Forms.MessageBox]::Show('Foxsocket is no longer at its installation location. Reinstall Foxsocket to resume Host setup. Linux has been preserved.', 'Foxsocket setup') | Out-Null
    $mutex.ReleaseMutex(); $mutex.Dispose(); exit 1
}
$script:progress = @{ phase = 'start'; boot = ''; ownsUbuntu = $false }
New-Item -ItemType Directory -Force -Path $setupDir | Out-Null
if (Test-Path -LiteralPath $stateFile) {
    try {
        $saved = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
        $script:progress = @{ phase = $saved.phase; boot = $saved.boot; ownsUbuntu = ($saved.ownsUbuntu -eq $true) }
    } catch { [System.Windows.Forms.MessageBox]::Show('Saved Host setup could not be read. No Linux environment has been changed.', 'Foxsocket setup') | Out-Null; exit 1 }
}
function Save-Progress {
    $script:progress | ConvertTo-Json | Set-Content -LiteralPath ($stateFile + '.tmp') -Encoding UTF8
    Move-Item -LiteralPath ($stateFile + '.tmp') -Destination $stateFile -Force
}
function Set-Resume([bool]$Enabled) {
    if ($Enabled) {
        # Retain the helper outside installer temp files so it survives a reboot.
        foreach ($name in @('host-setup.ps1', 'host-prerequisites.ps1')) {
            $source = Join-Path $PSScriptRoot $name
            $destination = Join-Path $setupDir $name
            if ([IO.Path]::GetFullPath($source) -ne [IO.Path]::GetFullPath($destination)) { Copy-Item -LiteralPath $source -Destination $destination -Force }
        }
        $command = Get-HostSetupResumeCommand $powerShell (Join-Path $setupDir 'host-setup.ps1') $AppPath
        if (!(Test-Path $runKey)) { New-Item -Path $runKey -Force | Out-Null }
        New-ItemProperty -Path $runKey -Name 'FoxsocketHostSetup' -Value $command -PropertyType String -Force | Out-Null
    } else { Remove-ItemProperty -Path $runKey -Name 'FoxsocketHostSetup' -ErrorAction SilentlyContinue }
}
function Get-Distros {
    # Registry inventory does not start Linux or confuse an unavailable CLI with
    # an empty list. System readiness is checked separately by WSL installation.
    $key = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss'
    if (Test-Path $key) {
        Get-ChildItem $key | ForEach-Object { (Get-ItemProperty $_.PSPath).DistributionName } | Where-Object { $_ }
    }
}
function Get-UbuntuLauncher {
    $package = Get-AppxPackage -Name 'CanonicalGroupLimited.Ubuntu24.04LTS' | Select-Object -First 1
    if ($package) {
        $launcher = Join-Path $package.InstallLocation 'ubuntu2404.exe'
        if (Test-Path -LiteralPath $launcher) { return $launcher }
    }
    throw 'Ubuntu downloaded but its registration launcher is not available yet. Choose Try again to finish installing it.'
}
function Write-Stage([string]$Text) {
    $status.Text = $Text
    $log.AppendText($Text + [Environment]::NewLine + [Environment]::NewLine)
    [System.Windows.Forms.Application]::DoEvents()
}
function Invoke-SetupProcess([string]$Exe, [string]$Arguments, [string]$InputText = '', [switch]$Elevate, [int]$TimeoutSeconds = 1800) {
    $info = New-Object Diagnostics.ProcessStartInfo
    $info.FileName = $Exe
    $info.Arguments = $Arguments
    $info.UseShellExecute = [bool]$Elevate
    $info.CreateNoWindow = !$Elevate
    $info.WindowStyle = 'Hidden'
    if ($Elevate) { $info.Verb = 'runas' }
    else { $info.RedirectStandardOutput = $true; $info.RedirectStandardError = $true; $info.RedirectStandardInput = $true }
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $info
    try { $null = $process.Start() } catch { throw 'Windows permission was declined or setup could not start. Choose Try again when you are ready.' }
    if (!$Elevate) {
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if ($InputText) { $process.StandardInput.Write($InputText.Replace("`r`n", "`n") + "`n") }
        $process.StandardInput.Close()
    }
    $timer = [Diagnostics.Stopwatch]::StartNew()
    while (!$process.WaitForExit(100)) {
        [System.Windows.Forms.Application]::DoEvents()
        if ($timer.Elapsed.TotalSeconds -gt $TimeoutSeconds) {
            # Do not terminate an elevated Windows servicing operation.
            if (!$Elevate) { $process.Kill() }
            throw 'Setup is taking longer than expected. Let Windows finish any active installation, then retry. Your progress is saved.'
        }
    }
    $result = @{ code = $process.ExitCode; output = '' }
    if (!$Elevate) { $result.output = ($stdout.Result + $stderr.Result).Replace([string][char]0, '') }
    $process.Dispose()
    return $result
}
function Require-Success($Result, [string]$Step) {
    if ($Result.code -ne 0) {
        # WSL output is local installation diagnostics, never uploaded.
        $log.AppendText($Result.output + [Environment]::NewLine)
        throw "$Step did not finish (Windows code $($Result.code)). Check your internet connection. If Windows reports virtualization is disabled, enable it in your PC firmware, then retry."
    }
}
function Request-Restart([string]$Boot) {
    $script:progress.phase = 'restart'; $script:progress.boot = $Boot
    Save-Progress; Set-Resume $true
    Write-Stage 'Windows needs a restart. Save your work, then choose Restart Windows. Foxsocket setup will reopen after you sign in to this account.'
    $script:nextAction = 'restart'; $action.Text = 'Restart Windows'
}
function Start-HostSetup {
    $boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToUniversalTime().ToString('o')
    $restart = (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending') -or (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')
    $distros = @(Get-Distros)
    $step = Get-HostSetupAction $script:progress $distros $boot $restart
    if ($step -eq 'restart') { Request-Restart $boot; return }
    if ($step -eq 'existing') {
        Set-Resume $false
        Write-Stage ('Linux is already installed: ' + ($distros -join ', ') + '. Continue in Foxsocket to choose and check your environment. Existing accounts and files have been preserved.')
        $script:nextAction = 'open'; $action.Text = 'Open Foxsocket'; return
    }
    if ($step -eq 'windows' -and (Test-Path -LiteralPath $wsl)) {
        Write-Stage 'Checking whether Windows already supports Linux.'
        $probe = Invoke-SetupProcess $wsl '--status' -TimeoutSeconds 60
        if ($probe.code -eq 0) { $step = 'install' }
    }
    Set-Resume $true
    if ($step -eq 'windows') {
        Write-Stage 'Preparing Windows for Linux. Approve the Windows permission prompt. Downloading Windows components can take several minutes.'
        # This constant command contains no user-controlled state or paths.
        $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes('& "$env:SystemRoot\System32\wsl.exe" --install --no-distribution; exit $LASTEXITCODE'))
        $result = Invoke-SetupProcess $powerShell "-NoProfile -NonInteractive -EncodedCommand $encoded" -Elevate
        if ($result.code -notin @(0, 3010, 1641)) { throw "Windows could not prepare Linux (code $($result.code)). Retry and approve its permission prompt. Check Windows Update and firmware virtualization if the problem continues." }
        # Always cross a reboot boundary after first enabling WSL: some WSL
        # versions return zero even when Windows features await a restart.
        Request-Restart $boot; return
    }
    if ($step -eq 'install') {
        Write-Stage 'Downloading and installing Ubuntu 24.04 for your Windows account. Keep this PC online and plugged in. No terminal commands are needed.'
        $script:progress.phase = 'install'; $script:progress.ownsUbuntu = $true; Save-Progress
        $result = Invoke-SetupProcess $wsl '--install -d Ubuntu-24.04 --no-launch --web-download'
        if ($result.code -in @(3010, 1641)) { Request-Restart $boot; return }
        Require-Success $result 'Ubuntu installation'
        if (@(Get-Distros) -notcontains 'Ubuntu-24.04') {
            # Older WSL installs the Store package without registering it when
            # --no-launch is used. The official launcher supports unattended
            # registration; our next step replaces root with a regular account.
            Write-Stage 'Finishing Ubuntu registration for this Windows account.'
            Require-Success (Invoke-SetupProcess (Get-UbuntuLauncher) 'install --root') 'Ubuntu registration'
        }
        if (@(Get-Distros) -notcontains 'Ubuntu-24.04') { throw 'Ubuntu has not registered yet. Choose Try again to finish installation.' }
    }
    $script:progress.phase = 'initialize'; Save-Progress
    Write-Stage 'Creating the Foxsocket Linux account and enabling its background service manager.'
    $result = Invoke-SetupProcess $wsl '-d Ubuntu-24.04 -u root --exec sh -s' (Get-HostSetupLinuxScript)
    Require-Success $result 'Ubuntu account setup'
    Require-Success (Invoke-SetupProcess $wsl '--terminate Ubuntu-24.04' -TimeoutSeconds 60) 'Ubuntu restart'
    Write-Stage 'Checking Ubuntu can start with the new account and service manager.'
    $result = Invoke-SetupProcess $wsl '-d Ubuntu-24.04 --exec sh -c "id -un; ps -p 1 -o comm="' -TimeoutSeconds 120
    Require-Success $result 'Ubuntu verification'
    if ($result.output -notmatch '(?m)^foxsocket\s*$' -or $result.output -notmatch '(?m)^systemd\s*$') { throw 'Ubuntu is installed but its account or background service manager is not ready. Choose Try again.' }
    $script:progress.phase = 'complete'; $script:progress.ownsUbuntu = $false; Save-Progress; Set-Resume $false
    Write-Stage 'Ubuntu is ready. Continue in Foxsocket to prepare OpenClaw and connect your AI account. A model reply is still required to finish agent setup.'
    $script:nextAction = 'open'; $action.Text = 'Open Foxsocket'
}

$form = New-Object Windows.Forms.Form
$form.Text = 'Foxsocket - Prepare this Host'
$form.ClientSize = New-Object Drawing.Size(650, 420)
$form.StartPosition = 'CenterScreen'
$form.Font = New-Object Drawing.Font('Segoe UI', 10)
$form.FormBorderStyle = 'FixedDialog'; $form.MaximizeBox = $false
$status = New-Object Windows.Forms.Label
$status.SetBounds(24, 20, 602, 75)
$status.Text = 'Foxsocket will prepare Windows and Ubuntu for your agent. Windows may ask for administrator permission and a restart. Your existing Linux environments will be preserved.'
$log = New-Object Windows.Forms.TextBox
$log.SetBounds(24, 105, 602, 240); $log.Multiline = $true; $log.ReadOnly = $true; $log.ScrollBars = 'Vertical'
$action = New-Object Windows.Forms.Button
$action.SetBounds(410, 363, 216, 36); $action.Text = 'Prepare this Host'
$later = New-Object Windows.Forms.Button
$later.SetBounds(24, 363, 160, 36); $later.Text = 'Continue later'
$form.Controls.AddRange(@($status, $log, $action, $later))
$script:busy = $false; $script:nextAction = 'setup'
$later.Add_Click({ $form.Close() })
$form.Add_FormClosing({ param($sender, $event) if ($script:busy) { $event.Cancel = $true } })
$action.Add_Click({
    if ($script:busy) { return }
    $script:busy = $true; $action.Enabled = $false; $later.Enabled = $false
    try {
        if ($script:nextAction -eq 'restart') {
            $answer = [Windows.Forms.MessageBox]::Show('Save your work first. Restart Windows now?', 'Foxsocket setup', 'YesNo', 'Question')
            if ($answer -eq 'Yes') { Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\shutdown.exe') -ArgumentList '/r /t 0' -WindowStyle Hidden }
        } elseif ($script:nextAction -eq 'open') {
            if (!(Test-Path -LiteralPath $AppPath)) { throw 'Foxsocket could not be found. Reinstall the app to continue. Ubuntu has been preserved.' }
            Start-Process -FilePath $AppPath -ArgumentList '--host-setup' -WindowStyle Normal
            $script:busy = $false; $form.Close()
        } else { Start-HostSetup }
    } catch {
        Write-Stage $_.Exception.Message
        $script:nextAction = 'setup'; $action.Text = 'Try again'
    } finally { $script:busy = $false; $action.Enabled = $true; $later.Enabled = $true }
})
# Installation / sign-in opens the guided flow and immediately checks readiness.
$form.Add_Shown({ $action.PerformClick() })
try { $null = $form.ShowDialog() } finally { $mutex.ReleaseMutex(); $mutex.Dispose(); $form.Dispose() }
