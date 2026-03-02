# InfraGenie Backend Test Server

Simple Express server for testing the InfraGenie VS Code extension.

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

## Test

Test the initial spec endpoint:
```bash
curl -X POST http://localhost:3000/spec/init \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a REST API","userInput":{"projectName":"test","cloudProvider":"AWS"}}'
```

Test the chat endpoint:
```bash
curl -X POST http://localhost:3000/spec/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Add authentication","history":[]}'
```

The server runs on `http://localhost:3000`.

## Configure Extension

In VS Code settings, set:
- `infraGenie.apiEndpoint`: `http://localhost:3000`
- `infraGenie.apiTimeout`: `30000` (or your preferred timeout)
