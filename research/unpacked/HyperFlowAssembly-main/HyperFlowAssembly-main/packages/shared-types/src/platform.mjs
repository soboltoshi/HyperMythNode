import {
  SURFACE_AUTH_MODES,
  SURFACE_DEFINITIONS,
  SURFACE_PAYMENT_MODES,
  SURFACE_VISIBILITY_MODES,
} from "./surfaces.mjs";

export const PLATFORM_SITE_IDS = ["larpa", "hashart"];

export const PLATFORM_VISIBILITY_MODES = SURFACE_VISIBILITY_MODES;

export const PLATFORM_AUTH_MODES = SURFACE_AUTH_MODES;

export const PLATFORM_PAYMENT_MODES = SURFACE_PAYMENT_MODES;

export const PLATFORM_SOURCE_MODES = [
  "image_upload",
  "image_url",
  "text_prompt",
  "reference_url",
  "video_reference_url",
  "youtube_url",
];

export const PLATFORM_AUDIO_MODES = [
  "music_led",
  "voice_led",
  "silent",
  "mixed",
];

export const PLATFORM_PLANNER_PASSES = [
  "structural",
  "cinematic",
  "editorial",
];

export const PLATFORM_SLOP_HEURISTICS = [
  "meaningless_motion",
  "no_money_shot",
  "repetitive_framing",
  "incoherent_ending",
  "dead_middle",
  "climax_too_early",
  "samey_energy",
  "visual_clutter",
  "weak_hook",
  "weak_escalation",
  "random_spectacle",
  "overstuffed_montage",
  "bad_emotional_arc",
];

export const PLATFORM_ROUTE_MAP = {
  larpa: SURFACE_DEFINITIONS["larpa-web"].routes.map((route) => ({
    path: route.path,
    role: route.role,
    publicAccess: route.publicAccess,
  })),
  hashart: SURFACE_DEFINITIONS["hashart-web"].routes.map((route) => ({
    path: route.path,
    role: route.role,
    publicAccess: route.publicAccess,
  })),
};

export const PLATFORM_SITE_DEFINITIONS = {
  larpa: {
    siteId: "larpa",
    role: SURFACE_DEFINITIONS["larpa-web"].role,
    authMode: SURFACE_DEFINITIONS["larpa-web"].authMode,
    paymentMode: SURFACE_DEFINITIONS["larpa-web"].paymentMode,
    defaultVisibility: SURFACE_DEFINITIONS["larpa-web"].defaultVisibility,
    routeMap: PLATFORM_ROUTE_MAP.larpa,
  },
  hashart: {
    siteId: "hashart",
    role: SURFACE_DEFINITIONS["hashart-web"].role,
    authMode: SURFACE_DEFINITIONS["hashart-web"].authMode,
    paymentMode: SURFACE_DEFINITIONS["hashart-web"].paymentMode,
    defaultVisibility: SURFACE_DEFINITIONS["hashart-web"].defaultVisibility,
    routeMap: PLATFORM_ROUTE_MAP.hashart,
  },
};
