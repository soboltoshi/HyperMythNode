"use client";

import { startTransition, useEffect, useRef, useState } from "react";

const ASCII_RAMP = " .,:-=+*#%@";
const FIELD_COLUMNS = 42;
const FIELD_ROWS = 24;
const FIELD_DECAY = 0.92;
const FINGERTIP_INDICES = [4, 8, 12, 16, 20];
const MODEL_ASSET_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const FALLBACK_HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
] as const;

type Landmark = {
  x: number;
  y: number;
  z: number;
};

type HandLandmarkerResult = {
  landmarks?: Landmark[][];
  handedness?: Array<Array<{ categoryName?: string }>>;
};

type HandLandmarkerLike = {
  detectForVideo(videoFrame: HTMLVideoElement, timestamp: number): HandLandmarkerResult;
  close?: () => void;
};

type Point = {
  x: number;
  y: number;
};

type HandConnection = {
  start?: number;
  end?: number;
};

type Telemetry = {
  handCount: number;
  gesture: string;
  pulseCount: number;
};

type SimulationState = {
  heat: Float32Array;
  previousTips: Record<string, Point>;
};

export default function WebcamPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const landmarkerRef = useRef<HandLandmarkerLike | null>(null);
  const handConnectionsRef = useRef<number[][]>(FALLBACK_HAND_CONNECTIONS.map((pair) => [...pair]));
  const simulationRef = useRef<SimulationState>({
    heat: new Float32Array(FIELD_COLUMNS * FIELD_ROWS),
    previousTips: {}
  });
  const lastTelemetryAtRef = useRef(0);

  const [status, setStatus] = useState("standby");
  const [error, setError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    handCount: 0,
    gesture: "waiting",
    pulseCount: 0
  });

  useEffect(() => {
    return () => {
      stopCamera();
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
    };
  }, []);

  async function toggleCamera() {
    if (streamRef.current) {
      stopCamera();
      return;
    }

    setError(null);
    setStatus("loading optics");

    try {
      if (!landmarkerRef.current) {
        setStatus("loading hand landmarker");
        await ensureLandmarker();
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not expose webcam capture.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video node not ready.");
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      resetField();
      setStatus("calibrating");
      rafRef.current = window.requestAnimationFrame(renderLoop);
    } catch (cameraError) {
      const message =
        cameraError instanceof Error ? cameraError.message : "Unknown camera error";
      setError(message);
      stopCamera();
      setStatus("blocked");
    }
  }

  function stopCamera() {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    streamRef.current = null;
    lastVideoTimeRef.current = -1;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    clearCanvas();
    startTransition(() => {
      setTelemetry({ handCount: 0, gesture: "waiting", pulseCount: 0 });
      setStatus("standby");
    });
  }

  function resetField() {
    simulationRef.current.heat.fill(0);
    simulationRef.current.previousTips = {};
    clearCanvas();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function ensureLandmarker() {
    if (landmarkerRef.current) {
      return;
    }

    const visionModule = (await import("@mediapipe/tasks-vision")) as {
      FilesetResolver: {
        forVisionTasks(root: string): Promise<unknown>;
      };
      HandLandmarker: {
        HAND_CONNECTIONS?: HandConnection[];
        createFromOptions(vision: unknown, options: object): Promise<HandLandmarkerLike>;
      };
    };

    const vision = await visionModule.FilesetResolver.forVisionTasks(WASM_ROOT);
    const handLandmarker = await visionModule.HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_PATH
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.45,
      minTrackingConfidence: 0.45
    });

    landmarkerRef.current = handLandmarker;
    handConnectionsRef.current =
      visionModule.HandLandmarker.HAND_CONNECTIONS?.map((connection) => [
        connection.start ?? 0,
        connection.end ?? 0
      ]) ?? FALLBACK_HAND_CONNECTIONS.map((pair) => [...pair]);
  }

  function renderLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handLandmarker = landmarkerRef.current;

    if (!video || !canvas || !handLandmarker) {
      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      rafRef.current = window.requestAnimationFrame(renderLoop);
      return;
    }

    if (video.currentTime === lastVideoTimeRef.current) {
      rafRef.current = window.requestAnimationFrame(renderLoop);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    lastVideoTimeRef.current = video.currentTime;

    const result = handLandmarker.detectForVideo(video, performance.now());
    const pulseCount = renderField(canvas, result, simulationRef.current, handConnectionsRef.current);
    const handCount = result.landmarks?.length ?? 0;
    const gesture = classifyGesture(result.landmarks ?? []);
    const now = performance.now();

    if (now - lastTelemetryAtRef.current > 120) {
      lastTelemetryAtRef.current = now;
      startTransition(() => {
        setTelemetry({
          handCount,
          gesture,
          pulseCount
        });
        setStatus(handCount > 0 ? "tracking" : "searching");
      });
    }

    rafRef.current = window.requestAnimationFrame(renderLoop);
  }

  return (
    <main className="shell webcamShell">
      <section className="webcamHero">
        <div className="stack">
          <p className="eyebrow">Webcam Field Lab</p>
          <h1>Hand-tracked ASCII fire for the support surface.</h1>
          <p className="lede">
            This browser lab now runs a real hand-landmarker pipeline and turns live
            fingertip motion into a reactive ASCII field. It remains subordinate to
            the Quest 3 release path, but it is now a functional camera surface
            instead of a placeholder.
          </p>
          <div className="inlineRow">
            <button className="action" onClick={toggleCamera} type="button">
              {streamRef.current ? "Stop Camera" : "Start Hand Field"}
            </button>
            <button className="actionGhost" onClick={resetField} type="button">
              Reset Field
            </button>
            <span className="statusPill">{status}</span>
          </div>
          {error ? <p className="errorText">Camera error: {error}</p> : null}
        </div>

        <aside className="panel webcamMetrics">
          <div>
            <span className="panelKicker">Hands</span>
            <strong>{telemetry.handCount}</strong>
          </div>
          <div>
            <span className="panelKicker">Gesture</span>
            <strong>{telemetry.gesture}</strong>
          </div>
          <div>
            <span className="panelKicker">Field Pulses</span>
            <strong>{telemetry.pulseCount}</strong>
          </div>
        </aside>
      </section>

      <section className="webcamWorkbench">
        <article className="panel webcamViewport">
          <div className="webcamComposite">
            <video
              ref={videoRef}
              autoPlay
              className="webcamVideo"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="webcamOverlay" />
            {!streamRef.current ? (
              <div className="webcamScrim">
                <p className="panelKicker">Support Surface</p>
                <strong>Quest 3 ships first. This lab proves the hand-field loop.</strong>
              </div>
            ) : null}
          </div>
        </article>

        <aside className="panel webcamNotes">
          <p className="panelKicker">Current Stack</p>
          <p>
            MediaPipe hand landmarks drive a low-resolution ASCII heat field, then
            the overlay draws landmark bones and fingertip emissions over the live
            camera feed.
          </p>
          <p>
            The field uses a 42-column lattice so the support surface still mirrors
            the bounded-world language used by the MR/VR embodiment box.
          </p>
          <div className="notes">
            <p>Pinch compresses the field.</p>
            <p>Raised fingers flare the emitters.</p>
            <p>Sweeps leave brighter ASCII wakes.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function renderField(
  canvas: HTMLCanvasElement,
  result: HandLandmarkerResult,
  simulation: SimulationState,
  handConnections: number[][]
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }

  const width = canvas.width;
  const height = canvas.height;
  const heat = simulation.heat;
  const nextTips: Record<string, Point> = {};

  for (let index = 0; index < heat.length; index += 1) {
    heat[index] *= FIELD_DECAY;
  }

  const landmarks = result.landmarks ?? [];
  const pulseCount = landmarks.reduce((count, hand, handIndex) => {
    FINGERTIP_INDICES.forEach((tipIndex) => {
      const tip = hand[tipIndex];
      if (!tip) {
        return;
      }

      const cellX = tip.x * (FIELD_COLUMNS - 1);
      const cellY = tip.y * (FIELD_ROWS - 1);
      const key = `${handIndex}:${tipIndex}`;
      const previous = simulation.previousTips[key];
      const velocity = previous
        ? Math.hypot(tip.x - previous.x, tip.y - previous.y) * 140
        : 0.85;
      const energy = velocity + (tipIndex === 8 || tipIndex === 4 ? 1.2 : 0.75);

      depositHeat(heat, cellX, cellY, 2.4, energy);
      nextTips[key] = { x: tip.x, y: tip.y };
    });

    return count + FINGERTIP_INDICES.length;
  }, 0);

  simulation.previousTips = nextTips;

  context.clearRect(0, 0, width, height);
  context.save();
  context.globalCompositeOperation = "lighter";

  const cellWidth = width / FIELD_COLUMNS;
  const cellHeight = height / FIELD_ROWS;
  context.font = `${Math.floor(cellHeight * 0.92)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let row = 0; row < FIELD_ROWS; row += 1) {
    for (let column = 0; column < FIELD_COLUMNS; column += 1) {
      const intensity = heat[row * FIELD_COLUMNS + column];
      if (intensity < 0.08) {
        continue;
      }

      const glyphIndex = Math.min(
        ASCII_RAMP.length - 1,
        Math.floor(intensity * (ASCII_RAMP.length - 1))
      );
      const glyph = ASCII_RAMP[glyphIndex];
      const x = (column + 0.5) * cellWidth;
      const y = (row + 0.5) * cellHeight;
      const hue = 22 + intensity * 110;
      const alpha = Math.min(0.95, 0.18 + intensity * 0.22);

      context.fillStyle = `hsla(${hue}, 92%, 68%, ${alpha})`;
      context.fillText(glyph, x, y);
    }
  }

  const handedness = result.handedness ?? [];
  landmarks.forEach((hand, handIndex) => {
    const label = handedness[handIndex]?.[0]?.categoryName ?? "Hand";
    drawHandSkeleton(context, hand, handConnections, width, height, label);
  });

  context.restore();
  return pulseCount;
}

function drawHandSkeleton(
  context: CanvasRenderingContext2D,
  hand: Landmark[],
  handConnections: number[][],
  width: number,
  height: number,
  label: string
) {
  context.lineWidth = 2;
  context.strokeStyle = "rgba(142, 232, 201, 0.72)";
  context.fillStyle = "rgba(255, 212, 144, 0.92)";

  handConnections.forEach(([start, end]) => {
    const from = hand[start];
    const to = hand[end];
    if (!from || !to) {
      return;
    }

    context.beginPath();
    context.moveTo(from.x * width, from.y * height);
    context.lineTo(to.x * width, to.y * height);
    context.stroke();
  });

  hand.forEach((landmark, index) => {
    const radius = FINGERTIP_INDICES.includes(index) ? 5 : 2.75;
    context.beginPath();
    context.arc(landmark.x * width, landmark.y * height, radius, 0, Math.PI * 2);
    context.fill();
  });

  const wrist = hand[0];
  if (wrist) {
    context.fillStyle = "rgba(237, 242, 255, 0.9)";
    context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(label, wrist.x * width + 26, wrist.y * height - 16);
  }
}

function classifyGesture(hands: Landmark[][]) {
  if (hands.length === 0) {
    return "searching";
  }

  for (const hand of hands) {
    const pinchDistance = distance(hand[4], hand[8]);
    if (pinchDistance > 0 && pinchDistance < 0.06) {
      return "pinch";
    }

    const wrist = hand[0];
    const index = hand[8];
    if (wrist && index && wrist.y - index.y > 0.18) {
      return "flare";
    }
  }

  return "sweep";
}

function depositHeat(
  heat: Float32Array,
  centerX: number,
  centerY: number,
  radius: number,
  amount: number
) {
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(FIELD_COLUMNS - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(FIELD_ROWS - 1, Math.ceil(centerY + radius));

  for (let row = minY; row <= maxY; row += 1) {
    for (let column = minX; column <= maxX; column += 1) {
      const dx = column - centerX;
      const dy = row - centerY;
      const distanceSquared = dx * dx + dy * dy;
      const falloff = Math.max(0, 1 - distanceSquared / (radius * radius));
      const index = row * FIELD_COLUMNS + column;
      heat[index] = Math.min(1.6, heat[index] + falloff * amount * 0.17);
    }
  }
}

function distance(a?: Landmark, b?: Landmark) {
  if (!a || !b) {
    return -1;
  }

  return Math.hypot(a.x - b.x, a.y - b.y);
}
