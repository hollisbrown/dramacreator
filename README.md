# dramacreator 🧕

## Setup
1. install node.js with npm
2. run `npm install`

## Folders
- [./client](./client): Client Source Code
- [./server](./server): Server Source Code
- [./common](./common): Shared Source Code of Client and Server
- [./dist](./dist): Build Server and Client Applikations, ready to deploy on Production Server

## Commands
All Commands can be found in the [package.json](./package.json) File in the Section `scripts`.

### Build 📦
- `npm run build`: Builds the Server and the Client. Builds can be found in [./dist](./dist).
- `npm run build:client`: Builds the Client. Build can be found in [./dist/client](./dist/client).
- `npm run build:server`: Builds the Server. Build can be found in [./dist/server](./dist/server).
- `npm run build:server:watched`: Builds the Server and rebuilds if a sourcefile changes Build can be found in [./dist/server](./dist/server).

### Start 🚀
The Start Commands are also starting a Build
- `npm start`: Builds the Server and the Client and starts the Server and the Client in an Test Server (see console Logs for URLs). If some src Files are changed, either the Server or client gets reloaded.
- `npm run start:server`: Builds the Server and starts it.
- `npm run start:server:watched`: Builds the Server and starts it. If a Sourcefile changes, it rebuilds and restarts the Server
- `npm run start:client`: Starts a Test Server (uses src Files, no new Build in [./dist](./dist) Folder).
