import { Panel } from '@/components/Panel'

const metrics = [
  ['Tick', '5'],
  ['Whitelist', 'Enabled'],
  ['Traders', '3'],
  ['Nodes', '4'],
  ['Fills', '3'],
  ['Settlement total', '37.35 COMPUTE_CREDIT'],
]

const fills = [
  ['TraderAlpha...111', '9xQeWv...KqX', '17.01', 'builder'],
  ['TraderBeta...111', 'Research...111', '9.30', 'research'],
  ['TraderGamma...111', 'Render...111', '11.04', 'render'],
]

const whitelist = [
  'TraderAlpha111111111111111111111111111111111',
  'TraderBeta1111111111111111111111111111111111',
  'TraderGamma111111111111111111111111111111111',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-line bg-panel px-6 py-6 shadow-glow">
          <div className="text-xs uppercase tracking-[0.26em] text-accent">HyperMyths · Computation Exchange · Solana Whitelist</div>
          <h1 className="mt-3 text-4xl font-semibold">Private Superbrain Compute Market</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            This web GUI is the operator shell over a local matching engine. The exchange loop runs locally, matches jobs to nodes by minute pricing,
            and only allows whitelisted Solana trader and node-operator addresses to participate.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-6">
          {metrics.map(([label, value]) => (
            <Panel key={label} title={label}>
              <div className="text-2xl font-semibold">{value}</div>
            </Panel>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel title="Exchange Loop">
            <div className="space-y-3 text-sm text-muted">
              <p>Tick advances the market.</p>
              <p>Quotes are generated only for allowed addresses.</p>
              <p>Best quotes become fills, then local settlement receipts.</p>
            </div>
          </Panel>
          <Panel title="Whitelist Policy">
            <div className="space-y-2 text-sm">
              <div>Trader allowlist</div>
              <div>Node operator allowlist</div>
              <div>Replace placeholder addresses with your real Solana addresses</div>
            </div>
          </Panel>
          <Panel title="Solana Later">
            <div className="space-y-2 text-sm">
              <div>Surfpool localnet adapter</div>
              <div>Signer abstraction</div>
              <div>Quote commitments</div>
              <div>Settlement receipts onchain</div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Whitelisted Traders">
            <div className="space-y-3 text-sm">
              {whitelist.map((entry) => (
                <div key={entry} className="rounded-xl border border-line px-4 py-3 text-accent">{entry}</div>
              ))}
            </div>
          </Panel>
          <Panel title="Recent Fills">
            <div className="space-y-3 text-sm">
              {fills.map(([payer, node, total, role]) => (
                <div key={`${payer}-${node}`} className="rounded-xl border border-line px-4 py-3">
                  <div className="font-medium">{payer} → {node}</div>
                  <div className="mt-2 text-muted">{role} · ask {total} COMPUTE_CREDIT</div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}
