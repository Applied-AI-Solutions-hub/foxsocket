# Working on two PCs

This folder is the source project. Use the files at its root; an older nested command-center folder may exist and is ignored by Git. The installers folder is shared through OneDrive but excluded from Git.

Private repository: https://github.com/Applied-AI-Solutions-hub/applied-ai-command-center

On the second PC, clone this repository into a separate local working folder. Use GitHub to pull before starting and commit/push when finished. Avoid editing the same OneDrive-synced Git checkout simultaneously on both computers: OneDrive sync is not a replacement for Git merging.

Install Node.js and pnpm, then run pnpm install and pnpm start. Run pnpm dist to build a Windows installer. Each PC needs its own gateway connection and lighting setup. This initial version expects a local Ubuntu-24.04 WSL distribution with OpenClaw and an OpenRGB SDK server on 127.0.0.1:6742. It will not automatically reach Sparky on the other PC.

Credentials, chat histories, personal notes and device profiles are not part of this repository. The earlier source folder in Documents/Codex is retained as a backup; make future changes here.
