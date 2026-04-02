"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const DEFAULT_KERNEL = "http://127.0.0.1:8787";
const KERNEL = (process.env.NEXT_PUBLIC_KERNEL_URL ?? DEFAULT_KERNEL).replace(/\/+$/, "");

// ---- Protocol types (mirror lx-protocol) ----

type StudioPreset = {
  slug: string;
  title: string;
  description: string;
  route: string;
  duration_seconds: number;
  price_label: string;
  audio_default: boolean;
  visual_mode: string;
};

type StylePreset = {
  slug: string;
  title: string;
  description: string;
};

type ServiceManifest = {
  service: string;
  adapter: string;
  release_focus: string;
  payment_mode: string;
  studios: StudioPreset[];
  style_presets: StylePreset[];
  endpoints: {
    create_job: string;
    get_job_template: string;
    get_report_template: string;
    get_video_template: string;
  };
};

type SceneCard = {
  index: number;
  title: string;
  beat: string;
  visual_prompt: string;
  camera_motion: string;
  caption: string;
};

type OutputManifest = {
  render_mode: string;
  preview_url: string;
  report_url: string;
  download_name: string;
  poster_text: string;
  gradient_stops: string[];
};

type Job = {
  job_id: string;
  studio: string;
  status: string;
  package_type: string;
  duration_seconds: number;
  project_title: string;
  core_idea: string;
  audio_on: boolean;
  style_preset: string;
  created_at: string;
  updated_at: string;
  summary: string;
  scene_cards: SceneCard[];
  output: OutputManifest;
};

type KernelStatus = "connecting" | "ok" | "error";

// ---- Default form values ----

const EMPTY_FORM = {
  studio: "HashCinema",
  stylePreset: "hyperflow_assembly",
  projectTitle: "",
  coreIdea: "",
  story: "",
  audioOn: false,
};

// ---- Page ----

export default function HyperCinemaPage() {
  const [manifest, setManifest] = useState<ServiceManifest | null>(null);
  const [kernelStatus, setKernelStatus] = useState<KernelStatus>("connecting");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchManifest = useCallback(async () => {
    try {
      const res = await fetch(`${KERNEL}/api/service`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: ServiceManifest = await res.json();
      setManifest(data);
      setKernelStatus("ok");
    } catch {
      setKernelStatus("error");
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${KERNEL}/api/jobs`);
      if (!res.ok) return;
      const data: { jobs: Job[] } = await res.json();
      setJobs(data.jobs ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchManifest();
    fetchJobs();
  }, [fetchManifest, fetchJobs]);

  // When studio changes, default audio_on to match studio's audio_default
  useEffect(() => {
    if (!manifest) return;
    const studio = manifest.studios.find((s) => s.slug === form.studio);
    if (studio) {
      setForm((f) => ({ ...f, audioOn: studio.audio_default }));
    }
  }, [form.studio, manifest]);

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!form.coreIdea.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${KERNEL}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio: form.studio,
          package_type: "1d",
          duration_seconds: null,
          project_title: form.projectTitle,
          core_idea: form.coreIdea,
          story: form.story,
          characters: "",
          visual_style: "",
          source_material: "",
          lyrics_dialogue: "",
          audio_on: form.audioOn,
          requested_prompt: "",
          token_address: "",
          chain: "",
          style_preset: form.stylePreset,
        }),
      });
      if (!res.ok) throw new Error(`Kernel returned ${res.status}`);
      const job: Job = await res.json();
      setJobs((prev) => [job, ...prev]);
      setSelectedJob(job);
      setForm((f) => ({ ...f, coreIdea: "", story: "", projectTitle: "" }));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Kernel unreachable.");
    }
    setSubmitting(false);
  }

  function exportJobJson(job: Job) {
    const blob = new Blob([JSON.stringify(job, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.output.download_name || job.job_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const studios = manifest?.studios ?? [];
  const styles = manifest?.style_presets ?? [];

  return (
    <main className="shell">
      {/* ---- Header ---- */}
      <section className="hero">
        <p className="eyebrow">HyperCinema Operator</p>
        <h1>Cinema studio surface.</h1>
        <p className="lede">
          Assemble video generation jobs locally. Scene cards, camera motions,
          and storyboard export — all kernel-owned, browser-previewed.
        </p>
        <div className="inlineRow" style={{ marginTop: 18 }}>
          <span
            className="statusPill"
            style={
              kernelStatus === "ok"
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : kernelStatus === "error"
                  ? { borderColor: "var(--danger)", color: "var(--danger)" }
                  : {}
            }
          >
            {kernelStatus === "ok"
              ? `Kernel ok — ${manifest?.adapter ?? "connecting…"}`
              : kernelStatus === "error"
                ? "Kernel unreachable — start lx-core on :8787"
                : "Connecting…"}
          </span>
          {manifest && (
            <span className="statusPill" style={{ color: "var(--muted)" }}>
              {manifest.payment_mode}
            </span>
          )}
          <Link href="/" className="actionGhost" style={{ fontSize: "0.82rem" }}>
            ← Back
          </Link>
        </div>
      </section>

      {/* ---- Two-column layout ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) minmax(280px,0.9fr)",
          gap: 24,
          alignItems: "start",
          marginTop: 12,
        }}
      >
        {/* ---- Left: create form ---- */}
        <div className="stack" style={{ gap: 20 }}>
          <form className="panel" onSubmit={handleCreateJob}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>
              New job
            </p>

            {/* Studio selector */}
            <label className="formLabel">
              Studio
              <select
                className="formSelect"
                value={form.studio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studio: e.target.value }))
                }
                disabled={studios.length === 0}
              >
                {studios.length === 0 ? (
                  <option>Loading…</option>
                ) : (
                  studios.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))
                )}
              </select>
            </label>

            {/* Studio description */}
            {manifest && (
              <p
                className="noteText"
                style={{ marginTop: 6, marginBottom: 14 }}
              >
                {manifest.studios.find((s) => s.slug === form.studio)
                  ?.description ?? ""}
              </p>
            )}

            {/* Style preset */}
            <label className="formLabel">
              Style preset
              <select
                className="formSelect"
                value={form.stylePreset}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stylePreset: e.target.value }))
                }
                disabled={styles.length === 0}
              >
                {styles.length === 0 ? (
                  <option>Loading…</option>
                ) : (
                  styles.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))
                )}
              </select>
            </label>

            {/* Project title */}
            <label className="formLabel" style={{ marginTop: 14 }}>
              Project title (optional)
              <input
                className="formInput"
                type="text"
                placeholder="Leave blank to derive from core idea"
                value={form.projectTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectTitle: e.target.value }))
                }
              />
            </label>

            {/* Core idea */}
            <label className="formLabel" style={{ marginTop: 14 }}>
              Core idea
              <input
                className="formInput"
                type="text"
                placeholder="One strong central idea or prompt"
                value={form.coreIdea}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coreIdea: e.target.value }))
                }
                required
              />
            </label>

            {/* Story */}
            <label className="formLabel" style={{ marginTop: 14 }}>
              Story beats (optional)
              <textarea
                className="formTextarea"
                placeholder={"One beat per line or sentence.\nEach becomes a scene card."}
                rows={4}
                value={form.story}
                onChange={(e) =>
                  setForm((f) => ({ ...f, story: e.target.value }))
                }
              />
            </label>

            {/* Audio toggle */}
            <label
              className="inlineRow"
              style={{ marginTop: 14, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={form.audioOn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, audioOn: e.target.checked }))
                }
              />
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                Audio on
              </span>
            </label>

            {submitError && (
              <p className="errorText" style={{ marginTop: 10 }}>
                {submitError}
              </p>
            )}

            <div className="inlineRow" style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="action"
                disabled={submitting || !form.coreIdea.trim()}
              >
                {submitting ? "Assembling…" : "Assemble job"}
              </button>
              {kernelStatus === "error" && (
                <button
                  type="button"
                  className="actionGhost"
                  onClick={() => {
                    fetchManifest();
                    fetchJobs();
                  }}
                >
                  Retry kernel
                </button>
              )}
            </div>
          </form>

          {/* ---- Scene card report ---- */}
          {selectedJob && (
            <div className="panel">
              <div className="inlineRow" style={{ marginBottom: 16 }}>
                <p className="eyebrow" style={{ flex: 1, margin: 0 }}>
                  Storyboard — {selectedJob.job_id}
                </p>
                <button
                  className="actionGhost"
                  style={{ fontSize: "0.8rem" }}
                  onClick={() => exportJobJson(selectedJob)}
                >
                  Export JSON
                </button>
              </div>

              <div
                style={{
                  background: `linear-gradient(135deg, ${selectedJob.output.gradient_stops.join(", ")})`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <strong style={{ fontSize: "1.05rem" }}>
                  {selectedJob.project_title}
                </strong>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.84rem",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedJob.summary}
                </p>
              </div>

              <div className="stack" style={{ gap: 12 }}>
                {selectedJob.scene_cards.map((card) => (
                  <SceneCardBlock key={card.index} card={card} />
                ))}
              </div>

              <div
                className="inlineRow"
                style={{ marginTop: 16, flexWrap: "wrap" }}
              >
                <span className="statusPill">{selectedJob.studio}</span>
                <span className="statusPill">{selectedJob.style_preset}</span>
                <span className="statusPill">
                  {selectedJob.duration_seconds}s
                </span>
                <span className="statusPill">{selectedJob.package_type}</span>
                {selectedJob.audio_on && (
                  <span className="statusPill">audio</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---- Right: job list ---- */}
        <div>
          <div className="panel">
          <div className="inlineRow" style={{ marginBottom: 16 }}>
            <p className="eyebrow" style={{ flex: 1, margin: 0 }}>
              Jobs ({jobs.length})
            </p>
            <button
              className="actionGhost"
              style={{ fontSize: "0.8rem" }}
              onClick={fetchJobs}
              type="button"
            >
              Refresh
            </button>
          </div>
          {jobs.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              No jobs yet. Assemble your first job.
            </p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {jobs.map((job) => (
                <JobListItem
                  key={job.job_id}
                  job={job}
                  selected={selectedJob?.job_id === job.job_id}
                  onSelect={() => setSelectedJob(job)}
                  onExport={() => exportJobJson(job)}
                />
              ))}
            </div>
          )}
        </div>

          {/* Studios reference */}
          {manifest && (
            <div className="panel" style={{ marginTop: 16 }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                Studios
              </p>
              <div className="stack" style={{ gap: 8 }}>
                {manifest.studios.map((s) => (
                  <div
                    key={s.slug}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      background:
                        form.studio === s.slug
                          ? "rgba(142,232,201,0.06)"
                          : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setForm((f) => ({ ...f, studio: s.slug }))
                    }
                  >
                    <strong style={{ fontSize: "0.88rem" }}>{s.title}</strong>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.78rem",
                        color: "var(--muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ---- Sub-components ----

function SceneCardBlock({ card }: { card: SceneCard }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--line)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <div className="inlineRow" style={{ marginBottom: 6 }}>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          Scene {card.index}
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          {card.camera_motion}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
        {card.beat}
      </p>
      <p
        style={{
          margin: "5px 0 0",
          fontSize: "0.76rem",
          color: "var(--muted)",
          lineHeight: 1.4,
        }}
      >
        {card.visual_prompt}
      </p>
      {card.caption !== card.beat && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "0.76rem",
            color: "var(--accent-2)",
            fontStyle: "italic",
          }}
        >
          "{card.caption}"
        </p>
      )}
    </div>
  );
}

function JobListItem({
  job,
  selected,
  onSelect,
  onExport,
}: {
  job: Job;
  selected: boolean;
  onSelect: () => void;
  onExport: () => void;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${selected ? "rgba(142,232,201,0.4)" : "var(--line)"}`,
        background: selected ? "rgba(142,232,201,0.05)" : "transparent",
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      <div className="inlineRow">
        <strong style={{ fontSize: "0.85rem", flex: 1 }}>
          {job.project_title || job.job_id}
        </strong>
        <button
          className="actionGhost"
          style={{ fontSize: "0.72rem", padding: "4px 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
        >
          ↓
        </button>
      </div>
      <p
        style={{
          margin: "3px 0 0",
          fontSize: "0.76rem",
          color: "var(--muted)",
        }}
      >
        {job.studio} · {job.scene_cards.length} scenes · {job.duration_seconds}s
      </p>
    </div>
  );
}
