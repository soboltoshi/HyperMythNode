const milestones = [
  "Boot Unity embodiment shell on Quest 3.",
  "Support proper VR input and world interaction.",
  "Add mixed reality room anchoring and passthrough-ready interfaces.",
  "Connect shell proposals to the Rust truth kernel.",
  "Preview holographic builds before commitment."
];

export default function VrPage() {
  return (
    <main className="shell shellNarrow">
      <p className="eyebrow">Release Track</p>
      <h1>Meta Quest 3 first.</h1>
      <p className="lede">
        The first functional release is the VR app on Meta Quest 3 with proper VR
        and mixed reality. Desktop remains the development wrapper. Web remains a
        support surface.
      </p>

      <section className="stack">
        {milestones.map((milestone, index) => (
          <article key={milestone} className="panel">
            <span className="panelKicker">Milestone {index + 1}</span>
            <p>{milestone}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

