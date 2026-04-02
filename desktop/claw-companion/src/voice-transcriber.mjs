import os from "node:os";

import { env, pipeline } from "@xenova/transformers";
import wavDecoder from "wav-decoder";

const voiceModelName = process.env.VOICE_TRANSCRIBE_MODEL || "Xenova/whisper-tiny.en";
const voiceDevice = process.env.VOICE_TRANSCRIBE_DEVICE || "cpu";
const voiceLanguage = process.env.VOICE_TRANSCRIBE_LANGUAGE || "en";
const voiceChunkSeconds = Number.parseFloat(process.env.VOICE_TRANSCRIBE_CHUNK_SECONDS || "30");
const voiceStrideSeconds = Number.parseFloat(process.env.VOICE_TRANSCRIBE_STRIDE_SECONDS || "5");

let transcriberPromise;

configureTransformersRuntime();

function configureTransformersRuntime() {
  env.allowLocalModels = false;
  env.useBrowserCache = false;

  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = Math.max(1, Math.min(os.cpus().length || 1, 4));
    env.backends.onnx.wasm.simd = true;
  }
}

function mixToMono(channelData) {
  if (!Array.isArray(channelData) || channelData.length === 0) {
    return new Float32Array();
  }

  if (channelData.length === 1) {
    return channelData[0];
  }

  const length = channelData.reduce((max, channel) => Math.max(max, channel.length), 0);
  const mono = new Float32Array(length);

  for (const channel of channelData) {
    for (let index = 0; index < channel.length; index += 1) {
      mono[index] += channel[index];
    }
  }

  for (let index = 0; index < mono.length; index += 1) {
    mono[index] /= channelData.length;
  }

  return mono;
}

async function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline("automatic-speech-recognition", voiceModelName, {
      device: voiceDevice,
    });
  }

  return transcriberPromise;
}

export function getVoiceTranscriberStatus() {
  return {
    mode: "local-whisper",
    model: voiceModelName,
    device: voiceDevice,
    language: voiceLanguage,
    chunkSeconds: voiceChunkSeconds,
    strideSeconds: voiceStrideSeconds,
  };
}

export async function transcribeWavBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("audio buffer is empty");
  }

  const decoded = await wavDecoder.decode(buffer);
  if (!decoded?.channelData?.length || !Number.isFinite(decoded.sampleRate)) {
    throw new Error("unable to decode wav payload");
  }

  const samples = mixToMono(decoded.channelData);
  const transcriber = await getTranscriber();

  const result = await transcriber(
    {
      array: samples,
      sampling_rate: decoded.sampleRate,
    },
    {
      task: "transcribe",
      language: voiceLanguage,
      return_timestamps: false,
      chunk_length_s: Number.isFinite(voiceChunkSeconds) ? voiceChunkSeconds : 30,
      stride_length_s: Number.isFinite(voiceStrideSeconds) ? voiceStrideSeconds : 5,
    }
  );

  const transcript = String(result?.text || "").trim();
  if (!transcript) {
    throw new Error("local whisper backend returned no transcript");
  }

  return {
    transcript,
    confidence: 0.9,
    backend: `local-whisper:${voiceModelName}`,
    sampleRate: decoded.sampleRate,
    durationSeconds: samples.length / decoded.sampleRate,
  };
}
