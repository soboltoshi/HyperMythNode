export default function MobilePage() {
  return (
    <main className="shell shellNarrow">
      <p className="eyebrow">Mobile Companion</p>
      <h1>Companion, not primary embodiment.</h1>
      <p className="lede">
        Mobile is part of the plan, but not the first release surface. It should
        eventually support light monitoring, companion interactions, and simplified
        game loops once the Quest 3 app is functional.
      </p>

      <section className="stack">
        <article className="panel">
          <span className="panelKicker">Later Scope</span>
          <p>Session monitoring, command receipts, lightweight camera or touch loops.</p>
        </article>
        <article className="panel">
          <span className="panelKicker">Boundary</span>
          <p>Mobile remains a companion surface. It does not become the truth owner.</p>
        </article>
      </section>
    </main>
  );
}

