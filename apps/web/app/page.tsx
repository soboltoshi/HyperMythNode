import Link from "next/link";

const tracks = [
  {
    href: "/vr",
    title: "Quest 3 Release Track",
    body: "Primary release target. Proper VR plus mixed reality first, with desktop tooling supporting the release rather than replacing it."
  },
  {
    href: "/webcam",
    title: "Webcam Interaction Lab",
    body: "Handfire-style browser experiments, webcam input, and hand-tracked interaction patterns staged as subordinate web surfaces."
  },
  {
    href: "/hypercinema",
    title: "HyperCinema Operator",
    body: "Assemble video generation jobs, browse scene cards, and export storyboard JSON. Wired to the local kernel HyperCinema adapter."
  },
  {
    href: "/operator",
    title: "Operator Console",
    body: "Web instructions flow into the desktop companion and Hermes runtime. This is the browser-facing control plane for voice, text, and cloud deployment."
  },
  {
    href: "/mobile",
    title: "Mobile Companion",
    body: "Future companion surface. Useful for control, monitoring, and lightweight play loops after the VR app is functional."
  }
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Last Experiments</p>
        <h1>VR-first scaffold for Quest 3, with operator, webcam, and mobile follow-on surfaces.</h1>
        <p className="lede">
          The shell stays bounded. Truth stays in Rust. Unity stays embodiment. Web
          stays a support surface for operator tools, cloud instruction routing, and camera-driven experiments.
        </p>
      </section>

      <section className="grid">
        {tracks.map((track) => (
          <Link key={track.href} href={track.href} className="panel">
            <span className="panelKicker">Track</span>
            <h2>{track.title}</h2>
            <p>{track.body}</p>
          </Link>
        ))}
      </section>

      <section className="statusStrip">
        <div>
          <span>Embodiment</span>
          <strong>Quest 3 mixed reality + VR first</strong>
        </div>
        <div>
          <span>Web</span>
          <strong>Operator surface + web routing + webcam lab + HyperCinema</strong>
        </div>
        <div>
          <span>Mobile</span>
          <strong>Companion later</strong>
        </div>
      </section>
    </main>
  );
}
