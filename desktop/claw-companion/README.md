# Claw Companion

Desktop private-brain companion for the VR shell.

## What it does

- accepts instructions or voice uploads from the Quest shell
- routes prompts through the local `claw-code-parity` workspace when present
- uses a local Whisper-style backend by default for Quest voice transcription
- forwards recognized voice commands into the kernel as `quest3.voice.command`
- creates Hermes tasks from VR-originated instructions
- requests Cami intent proposals from Hermes (`/cami/intent`)
- confirms cinema proposals and forwards them to kernel + Hermes dispatch (`/proposal/confirm`)
- proxies native contactway controls to kernel (`/contactway/status`, `/contactway/connect`, `/contactway/disconnect`, `/contactway/intent`)

## Run

```powershell
cd C:\hypermythsX
npm --workspace desktop/claw-companion run serve
```

## Modes

- `status`
- `serve`
- `brain <prompt>`
- `route <prompt>`

## Voice backend

The `POST /voice` endpoint uses the local Whisper-style backend by default.

Set one of:

- `VOICE_TRANSCRIBE_MODE=local-whisper` for offline audio transcription
- `VOICE_TRANSCRIBE_MODE=transcript` for text uploads
- `VOICE_TRANSCRIBE_COMMAND=<command>` for a local audio-to-text command
- `VOICE_TRANSCRIBE_MODE=noop` for testing

Local whisper settings:

- `VOICE_TRANSCRIBE_MODEL` defaults to `Xenova/whisper-tiny.en`
- `VOICE_TRANSCRIBE_DEVICE` defaults to `cpu`
- `VOICE_TRANSCRIBE_LANGUAGE` defaults to `en`

The first voice run downloads the selected model into the local cache; after that it stays offline.
