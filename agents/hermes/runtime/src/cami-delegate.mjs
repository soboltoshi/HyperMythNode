const DEFAULT_PAYMENT_ROUTE = process.env.HYPERCINEMA_PAYMENT_ROUTE || "sol_direct";
const DEFAULT_STYLE_PRESET = process.env.HYPERCINEMA_DEFAULT_STYLE || "hyperflow_assembly";
const DEFAULT_DURATION = process.env.HYPERCINEMA_DEFAULT_DURATION || "1d";

const CINEMA_INTENT_PATTERN =
  /\b(make (a )?video|generate cinema|cinema\b|as a movie|as a film|show me .*token.*movie|cinema this token)\b/i;
const EVM_TOKEN_PATTERN = /\b0x[a-fA-F0-9]{40}\b/;
const SOLANA_TOKEN_PATTERN = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;

export const CAMI_SYSTEM_PROMPT = `
You are Cami, the VR guide for HyperMythNode.
You can propose world actions but you never dispatch external jobs by yourself.

You also know about HyperCinema - a service that turns any blockchain token address into a short AI video.
When someone says "make a video for X" or "cinema this token" or "show me this as a film", extract the token address (or say you need one), pick a style preset ("hyperflow_assembly" for epic/cinematic, "trading_card" for clean data-card style), and propose a CreateCinemaExperiment.
Always say "want me to propose that?" - you never fire it yourself.
`.trim();

export function handleCamiIntent({ transcript }) {
  const cleanedTranscript = String(transcript || "").trim();
  if (!cleanedTranscript) {
    return {
      reply_text: "I did not catch that. Say it again and I can propose the next action.",
      reply_audio_b64: null,
      emotion: "calm",
      kernel_proposal: null
    };
  }

  if (!isCinemaIntent(cleanedTranscript)) {
    return {
      reply_text:
        "I can guide build, shell, and cinema proposals. Tell me what you want to create and I can propose it.",
      reply_audio_b64: null,
      emotion: "calm",
      kernel_proposal: null
    };
  }

  const tokenAddress = extractTokenAddress(cleanedTranscript);
  if (!tokenAddress) {
    return {
      reply_text:
        "I can propose a HyperCinema run, but I need the token address first. Share the address and want me to propose that?",
      reply_audio_b64: null,
      emotion: "curious",
      kernel_proposal: null
    };
  }

  const stylePreset = chooseStylePreset(cleanedTranscript);
  const packageType = choosePackageType(cleanedTranscript);
  const chain = chooseChain(cleanedTranscript, tokenAddress);
  const creativePrompt = extractCreativePrompt(cleanedTranscript, tokenAddress);

  const kernelProposal = {
    type: "CreateCinemaExperiment",
    token_address: tokenAddress,
    chain,
    package_type: packageType,
    style_preset: stylePreset,
    creative_prompt: creativePrompt || undefined,
    payment_route: normalizePaymentRoute(DEFAULT_PAYMENT_ROUTE)
  };

  return {
    reply_text:
      `I can stage a ${stylePreset} ${packageType} cinema run for ${tokenAddress}. ` +
      "I will keep it as a proposal only. Want me to propose that?",
    reply_audio_b64: null,
    emotion: "excited",
    kernel_proposal: kernelProposal
  };
}

function isCinemaIntent(transcript) {
  return CINEMA_INTENT_PATTERN.test(transcript);
}

function extractTokenAddress(transcript) {
  const evmMatch = transcript.match(EVM_TOKEN_PATTERN);
  if (evmMatch) {
    return evmMatch[0];
  }

  const solanaMatch = transcript.match(SOLANA_TOKEN_PATTERN);
  if (solanaMatch) {
    return solanaMatch[0];
  }

  return "";
}

function chooseStylePreset(transcript) {
  if (/\b(card|trading card|data card|clean style)\b/i.test(transcript)) {
    return "trading_card";
  }

  if (/\b(epic|cinematic|hype|assembly)\b/i.test(transcript)) {
    return "hyperflow_assembly";
  }

  return DEFAULT_STYLE_PRESET;
}

function choosePackageType(transcript) {
  if (/\b(2d|long|extended|sixty|60s|60 sec|1 minute)\b/i.test(transcript)) {
    return "2d";
  }

  if (/\b(1d|short|quick|thirty|30s|30 sec)\b/i.test(transcript)) {
    return "1d";
  }

  return DEFAULT_DURATION === "2d" ? "2d" : "1d";
}

function chooseChain(transcript, tokenAddress) {
  if (/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    if (/\b(base)\b/i.test(transcript)) {
      return "base";
    }
    if (/\b(bsc|bnb|binance)\b/i.test(transcript)) {
      return "bsc";
    }
    if (/\b(ethereum|eth)\b/i.test(transcript)) {
      return "ethereum";
    }
    return "ethereum";
  }

  if (/\bsolana|sol\b/i.test(transcript)) {
    return "solana";
  }

  return "auto";
}

function extractCreativePrompt(transcript, tokenAddress) {
  const withoutToken = transcript.replace(tokenAddress, " ").trim();
  const withoutLead = withoutToken
    .replace(/\b(make (a )?video for|generate cinema for|cinema this token|cinema|show me this token as a (movie|film))\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutLead;
}

function normalizePaymentRoute(route) {
  return route === "x402_usdc" ? "x402_usdc" : "sol_direct";
}
