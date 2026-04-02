import { Panel } from '@/components/Panel'

const metrics = [
  ['Nodes', '4'],
  ['Jobs', '3'],
  ['Quotes', '3'],
  ['Fills', '3'],
  ['Settlement total', '40.17 COMPUTE_CREDIT'],
]

const nodes = [
  ['node-alpha', 'builder', '180m', '0.28/min', 'private'],
  ['node-beta', 'solver', '240m', '0.22/min', 'public'],
  ['node-gamma', 'research', '140m', '0.31/min', 'private'],
  ['node-delta', 'render', '320m', '0.19/min', 'public'],
]

const jobs = [
  ['job-001', 'builder', '45m', '18.00', 'high'],
  ['job-002', 'research', '30m', '12.00', 'normal'],
  ['job-003', 'render', '60m', '16.00', 'low'],
]

const quotes = [
  ['job-001', 'node-alpha', '17.01', '1.3485'],
  ['job-002', 'node-gamma', '9.30', '1.4187'],
  ['job-003', 'node-delta', '11.04', '1.3264'],
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-line bg-panel px-6 py-6 shadow-glow">
          <div className="text-xs uppercase tracking-[0.26em] text-accent">HyperMyths · Computation Markets First · Solana Ready</div>
          <h1 className="mt-3 text-4xl font-semibold">Private Superbrain Market Console</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            The browser panel is an operator surface for the local computation market. Keep pricing, matching, and settlement logic local in Rust.
            Add Solana later as a commitment and settlement adapter, not as the day-one dependency.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <Panel key={label} title={label}>
              <div className="text-2xl font-semibold">{value}</div>
            </Panel>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel title="Market Thesis">
            <div className="space-y-3 text-sm text-muted">
              <p>Nodes sell minutes. Jobs buy execution. Quotes become fills. Fills become settlement receipts.</p>
              <p>The private superbrain biases toward private nodes for sensitive work and applies urgency premiums only when demand justifies them.</p>
            </div>
          </Panel>
          <Panel title="Interfaces">
            <div className="space-y-2 text-sm">
              <div>CLI: scripting, export, debugging</div>
              <div>TUI: fast live operations</div>
              <div>Web GUI: richer dashboard and later wallet panels</div>
            </div>
          </Panel>
          <Panel title="Next Adapters">
            <div className="space-y-2 text-sm">
              <div>Surfpool localnet adapter</div>
              <div>Signer abstraction</div>
              <div>Solana quote commitments</div>
              <div>Settlement receipts onchain</div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel title="Nodes">
            <div className="space-y-3 text-sm">
              {nodes.map(([id, role, minutes, price, trust]) => (
                <div key={id} className="rounded-xl border border-line px-4 py-3">
                  <div className="flex items-center justify-between font-medium">
                    <span>{id}</span>
                    <span className="text-accent">{role}</span>
                  </div>
                  <div className="mt-2 text-muted">{minutes} · {price} · {trust}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Jobs">
            <div className="space-y-3 text-sm">
              {jobs.map(([id, role, minutes, budget, urgency]) => (
                <div key={id} className="rounded-xl border border-line px-4 py-3">
                  <div className="font-medium">{id}</div>
                  <div className="mt-2 text-muted">role {role} · {minutes} · max {budget}</div>
                  <div className="mt-1 text-accent2">urgency {urgency}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Top Quotes">
            <div className="space-y-3 text-sm">
              {quotes.map(([job, node, total, score]) => (
                <div key={`${job}-${node}`} className="rounded-xl border border-line px-4 py-3">
                  <div className="font-medium">{job} → {node}</div>
                  <div className="mt-2 text-muted">ask {total} COMPUTE_CREDIT</div>
                  <div className="mt-1 text-accent">score {score}</div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}
