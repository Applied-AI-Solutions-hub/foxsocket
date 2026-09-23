# Shared by the installer setup window and its isolated tests. No work on import.
function Get-HostSetupAction($State, [string[]]$Distros, [string]$Boot, [bool]$RestartPending) {
    if ($State.phase -eq 'restart' -and $State.boot -eq $Boot) { return 'restart' }
    if ($State.ownsUbuntu -and $Distros -contains 'Ubuntu-24.04') { return 'initialize' }
    if ($Distros.Count -gt 0) { return 'existing' }
    if ($RestartPending) { return 'restart' }
    if ($State.phase -eq 'restart' -and $State.boot -ne $Boot) { return 'install' }
    if ($State.phase -in @('install', 'initialize')) { return 'install' }
    return 'windows'
}

function Get-HostSetupResumeCommand([string]$PowerShell, [string]$Script, [string]$AppPath) {
    # Paths are Windows filenames, passed as arguments, never interpolated into code.
    foreach ($value in @($PowerShell, $Script, $AppPath)) {
        if ($value -match '["\r\n]') { throw 'Invalid setup path.' }
    }
    return ('"{0}" -NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File "{1}" -AppPath "{2}"' -f $PowerShell, $Script, $AppPath)
}

function Get-HostSetupLinuxScript {
    # Only used for a distro created by this setup. No password or broad sudo grant.
    return @'
set -eu
if ! id foxsocket >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash foxsocket
fi
test "$(id -u foxsocket)" != 0
python3 - <<'PY'
import configparser, os
p = '/etc/wsl.conf'
c = configparser.ConfigParser()
c.read(p)
for section in ('boot', 'user'):
    if not c.has_section(section): c.add_section(section)
c.set('boot', 'systemd', 'true')
c.set('user', 'default', 'foxsocket')
with open(p + '.foxsocket.tmp', 'w') as f: c.write(f)
os.replace(p + '.foxsocket.tmp', p)
PY
'@
}
