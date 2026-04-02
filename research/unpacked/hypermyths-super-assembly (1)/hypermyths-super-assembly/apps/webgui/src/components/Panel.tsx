export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-panel p-5 shadow-glow">
      <div className="mb-4 text-xs uppercase tracking-[0.22em] text-accent">{title}</div>
      {children}
    </section>
  )
}
