async function getSnapshot() {
  try {
    const res = await fetch('http://127.0.0.1:8787/snapshot', { cache: 'no-store' });
    if (!res.ok) throw new Error('Kernel unavailable');
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const snapshot = await getSnapshot();

  return (
    <main style={{ padding: 24 }}>
      <h1>HyperMythX Operator Panel</h1>
      <p>Rust = truth · Unity = body · xLua = language</p>

      {!snapshot ? (
        <div style={{ padding: 16, border: '1px solid #444' }}>
          Kernel not running. Start <code>crates/hmx-core</code> first.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          <section style={{ border: '1px solid #333', padding: 16 }}>
            <h2>Snapshot</h2>
            <pre>{JSON.stringify(snapshot, null, 2)}</pre>
          </section>
        </div>
      )}
    </main>
  );
}
