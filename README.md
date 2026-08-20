# Voice Health Intake Screener

An end-to-end, voice-first medical intake web application powered by React, Node.js, WebSockets, and Google Gemini AI. The system conducts an automated, conversational screening interview with a patient and synthesizes a concise clinical summary report.

Application Screenshots & Visual Preview

1. Live Voice Intake & Visualizer (Barge-In Active)

Patient engages in a hands-free voice conversation with the AI assistant, featuring real-time microphone status and speech visualizers.

2. Synthesized Clinical Health Summary Report

Upon ending the call, the raw dialogue is parsed into a structured, clinical-grade summary report highlighting chief complaints, severity rating, and red flag warnings.

Key Features

- Live Conversational AI Intake: Hands-free, spoken medical interview with real-time speech recognition and text-to-speech audio responses.
- Barge-In Support: Seamless voice interaction allowing the patient to interrupt/speak over the AI assistant while it is talking.
- Text & Voice Fallbacks: Full hybrid support—patients can speak using their microphone or type messages in the chat interface.
- Synthesized Clinical Report: Converts raw dialogue into a structured, formatted medical report containing:
  - Patient Name & Chief Complaint
  - Symptom Onset, Duration & Severity Scale (1–10)
  - Associated / Secondary Symptoms
  - Concise Narrative Clinical Summary
  - Flagged Urgent Red Flags & Recommended Follow-up
- Incomplete Call Protection: Safely captures partial transcripts without crashing if a call ends prematurely.
- Real-time Visual Status Engine: Visual indicators for current agent state (CONNECTED, LISTENING, THINKING, SPEAKING, COMPLETED, DISCONNECTED) alongside an animated audio waveform.
- Multi-Model Fallback System: Automatic failover between Gemini models and REST endpoints to ensure high availability.

Tech Stack & Architecture

Layer | Technology / Library | Purpose
---|---|---
Frontend Framework | React 18 (Vite) | UI components, state management, audio visualizers, report dashboard
Styling | System UI / CSS3 | Clean, accessible clinical design system with fluid response indicators
Speech-to-Text (STT) | Web Speech API (SpeechRecognition) | Real-time browser speech capture and live transcription
Text-to-Speech (TTS) | Web Speech API (SpeechSynthesis) | Conversational voice output generation
Backend Runtime | Node.js + Express | Application server hosting WebSocket connection lifecycle
Real-time Protocol | ws (WebSockets) | Full-duplex persistent socket communication
AI / Intelligence Engine | Google Gemini API (@google/generative-ai) | Adaptive screening dialogue and structured report JSON generation
Environment Config | dotenv | Secure API key management

Adjusted Project Directory Structure

voice-health-screener/
├── README.md                      # Comprehensive project documentation (this file)
├── LICENSE                        # Project license
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI for lint/test/build
├── docs/
│   └── screenshots/
│       ├── live-voice-call.png
│   └── health-report-summary.png
├── client/                        # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/            # UI Components
│   │   │   ├── CallControls.jsx
│   │   │   ├── HealthReport.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── hooks/                 # Custom React Hooks
│   │   │   ├── useAudioRecorder.js
│   │   │   └── useWebSocket.js
│   │   ├── pages/                 # Route / view containers
│   │   ├── services/              # API / socket wrappers for frontend
│   │   ├── utils/                 # Shared utilities & helpers
│   │   ├── App.jsx                # Core dashboard layout & state engine
│   │   └── main.jsx               # React entry point
│   ├── tests/                     # Frontend unit / integration tests
│   ├── package.json
│   └── vite.config.js
├── server/                        # Node.js Express Backend
│   ├── src/
│   │   ├── config/                # env.js, configuration loaders
│   │   ├── controllers/           # HTTP route handlers
│   │   ├── services/              # llmService.js, reportService.js, sttService.js, ttsService.js
│   │   ├── websocket/             # callHandler.js (WebSocket session & message router)
│   │   └── server.js              # Express + HTTP server entry point
│   ├── tests/                     # Backend tests
│   ├── package.json
│   ├── .env.example               # Template environment configuration
│   └── Dockerfile                 # Optional: containerization for deployment
├── docker/                        # Docker compose & infra helpers
│   └── docker-compose.yml
├── scripts/                       # Helpful developer scripts (start, setup, etc.)
│   ├── start-dev.sh
│   └── setup-env.sh
├── .editorconfig
├── .eslintrc.cjs                  # ESLint config
└── prettier.config.js             # Prettier config

Why these changes

- Separate tests per subproject (client/tests, server/tests) to keep CI easy to configure.
- Add .github/workflows for CI: run lint, unit tests and build on PRs.
- controllers/ and services/ in server/ clarify HTTP routes vs business logic (easier to test).
- client/services and server/services unify where API/socket/LLM logic lives.
- Dockerfile + docker-compose simplifies local/dev and cloud deployment.
- Scripts folder centralizes common developer tasks (setup/start).
- Small server/README.md documents server-specific env, Docker, or deployment notes.
- LICENSE file and editor/formatter configs improve open-source hygiene.

Quick Start & Installation

Prerequisites

- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher
- Browser: Google Chrome or Microsoft Edge (recommended for Web Speech API support)
- Google Gemini API Key: Obtain an API key from Google AI Studio.

Step 1: Environment Setup

Create a .env file in the server/ directory:

```bash
cd server
cp .env.example .env
```

Add your Gemini API Key into server/.env:

```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

Step 2: Install Dependencies

Open two separate terminal windows:

Terminal 1: Server Setup

```bash
cd server
npm install
```

Terminal 2: Client Setup

```bash
cd client
npm install
```

Step 3: Run the Application

1. Start the Backend Server (Terminal 1):

```bash
cd server
npm start
```

Expected Output:

Server running on http://localhost:5000
WebSocket Server initialized

2. Start the Frontend Client (Terminal 2):

```bash
cd client
npm run dev
```

Expected Output:

VITE v5.4.x ready in XXX ms
➜ Local: http://localhost:5173/

How to Use

Open http://localhost:5173/ in Google Chrome.

- Click Start Live Voice Call.
- Allow browser microphone access when prompted.
- The AI assistant will greet you out loud through your speakers.
- Speak your responses naturally (e.g., "My name is Alex, and I have a headache.").
- Barge-in test: Click Push to Speak or start talking while the AI is speaking—the assistant will instantly pause and listen to you.
- Click End Call & Report when finished to generate the structured health summary.

Deployment Instructions

Backend Deployment (Render / Railway / Heroku)

- Push your repository to GitHub.
- Create a new Web Service on Render/Railway connected to your repository.
- Set Root Directory to: server
- Build Command: npm install
- Start Command: npm start
- Add Environment Variables:
  - GEMINI_API_KEY = your_actual_gemini_api_key
  - PORT = 5000

Frontend Deployment (Vercel / Netlify)

- Create a new project on Vercel connected to your repository.
- Set Root Directory to: client
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

License

This project is open-source and built for technical assessment purposes.
