import { ReactNode } from 'react'

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-glow">
      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-accent">{title}</div>
      {children}
    </section>
  )
}
