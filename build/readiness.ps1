param([Parameter(Mandatory=$true)][string]$OutFile)
# Read-only inventory. No software installation, service starts, network calls, or credentials.
$ErrorActionPreference = 'Stop'
$report = [ordered]@{}
$report['Computer'] = $env:COMPUTERNAME
$report['Architecture'] = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
try {
  $osInfo = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
  $windowsName = if ([int]$osInfo.CurrentBuildNumber -ge 22000) { 'Windows 11' } else { $osInfo.ProductName }
  $report['Windows'] = "$windowsName, build $($osInfo.CurrentBuildNumber)"
} catch { $report['Windows'] = 'Could not check; review Windows Settings' }
try {
  $machine = Get-CimInstance Win32_ComputerSystem -OperationTimeoutSec 3
  $report['Memory'] = "$([math]::Round($machine.TotalPhysicalMemory / 1GB, 1)) GB RAM"
  $processor = Get-CimInstance Win32_Processor -OperationTimeoutSec 3 | Select-Object -First 1
  $report['Processor'] = $processor.Name
  $report['Virtualization'] = if ($machine.HypervisorPresent) { 'Windows hypervisor detected; WSL readiness still needs verification' } elseif ($processor.VirtualizationFirmwareEnabled) { 'Firmware virtualization enabled; WSL readiness still needs verification' } else { 'Not confirmed; check virtualization before installing a WSL Host' }
} catch {
  $report['Memory'] = 'Could not check'
  $report['Processor'] = 'Could not check'
  $report['Virtualization'] = 'Could not check; manual verification needed'
}
try {
  $systemDisk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$($env:SystemDrive)'" -OperationTimeoutSec 3
  $report['Storage'] = "$([math]::Round($systemDisk.FreeSpace / 1GB, 1)) GB free on $($env:SystemDrive) (system drive)"
} catch { $report['Storage'] = 'Could not check system-drive free space' }
try {
  $video = @(Get-CimInstance Win32_VideoController -OperationTimeoutSec 3 | Select-Object -ExpandProperty Name)
  $report['Graphics'] = if ($video.Count) { ($video -join ', ') + '; model compatibility not tested' } else { 'No graphics adapter reported' }
} catch { $report['Graphics'] = 'Could not check' }
try {
  $restartPending = (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending') -or (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')
  $report['Restart'] = if ($restartPending) { 'Windows reports a pending restart; finish it before Host runtime setup' } else { 'No Windows Update/CBS restart flag detected; other installers may still require one' }
} catch { $report['Restart'] = 'Could not check' }
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$report['Node'] = if ($nodeCommand) { 'Windows Node detected; supported runtime version will be verified in the chosen environment' } else { 'No Windows Node detected; the OpenClaw installer can prepare its runtime' }
$distributions = @()
if (Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss') {
  $distributions = @(Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss' | ForEach-Object {
    $distroInfo = Get-ItemProperty $_.PSPath
    if ($distroInfo.DistributionName) { "$($distroInfo.DistributionName) (WSL $($distroInfo.Version))" }
  })
}
$report['Linux'] = if ($distributions.Count) { $distributions -join ', ' } else { 'No Linux environment registered for this Windows user' }
$report['OpenClaw'] = if (Get-Command openclaw -ErrorAction SilentlyContinue) { 'Windows command detected; version and configuration not verified' } else { 'No Windows command detected; OpenClaw inside Linux is checked later' }
$tailscalePath = Join-Path ${env:ProgramFiles} 'Tailscale\tailscale.exe'
$tailscaleNative = if (${env:ProgramW6432}) { Join-Path ${env:ProgramW6432} 'Tailscale\tailscale.exe' } else { $tailscalePath }
$report['Tailscale'] = if ((Test-Path $tailscalePath) -or (Test-Path $tailscaleNative)) { 'Installed; sign-in and private access not verified' } else { 'Not detected; optional for a local Host, needed for our remote pairing flow' }
$report['Model'] = 'Provider access is chosen and tested later; no credentials inspected'
$lines = @('[Readiness]')
foreach ($item in $report.GetEnumerator()) {
  $value = [string]$item.Value -replace '[\r\n\x00]', ' '
  $lines += "$($item.Key)=$value"
}
# NSIS ReadINIStr supports UTF-16; retain non-English computer and processor names.
[System.IO.File]::WriteAllLines($OutFile, $lines, [System.Text.Encoding]::Unicode)
