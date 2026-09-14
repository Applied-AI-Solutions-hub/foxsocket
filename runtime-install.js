const integrity=require('./build/runtime-integrity.json');
function installCommand(manifest=integrity) {
 if(manifest.url!=='https://openclaw.ai/install-cli.sh'||!/^[a-f0-9]{64}$/.test(manifest.sha256)||!/^\d+\.\d+\.\d+$/.test(manifest.version))throw Error('Invalid runtime integrity manifest.');
 // Both managed installation and the optional copied terminal command use this exact boundary.
 return `set -eu; file=$(mktemp); trap 'rm -f "$file"' EXIT; curl --fail --silent --show-error --location --proto =https --proto-redir =https --tlsv1.2 '${manifest.url}' -o "$file"; printf '%s  %s\\n' '${manifest.sha256}' "$file" | sha256sum --check --status; bash "$file" --prefix "$HOME/.local/share/agent-workspace/openclaw" --version '${manifest.version}' --no-onboard`;
}
module.exports={installCommand,integrity};
