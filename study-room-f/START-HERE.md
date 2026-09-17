# Study Room F - quick start

1. Install Node.js 20 LTS or newer (https://nodejs.org) if `node -v` fails.
2. Native build tools (needed once, for the terminal component):
   - Windows: during the Node installer tick "Automatically install the necessary tools",
     or install "Visual Studio Build Tools" with the "Desktop development with C++" workload.
   - macOS: `xcode-select --install`
   - Linux (Debian/Ubuntu): `sudo apt install build-essential python3`
3. Have at least one agent CLI installed, e.g. Claude Code: `npm install -g @anthropic-ai/claude-code`
   then run `claude` once in a terminal to sign in.
4. In this folder:

       npm install
       npm run dev

See COMMUNITY-FORK.md for what changed and how to edit the room or cast.
