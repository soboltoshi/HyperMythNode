import { Panel } from '@/components/Panel'

const services = [
  ['core-runtime', 'up', 'Heartbeat loop active'],
  ['solana-adapter', 'stub', 'Surfpool / RPC adapter pending'],
  ['governance-shell', 'warming', 'ASIMOG private decision loop'],
  ['web-control', 'up', 'Local operator surface ready'],
]

const tasks = [
  ['index-local-wallet-state', 'builder-agent', 'running'],
  ['quote-compute-minute', 'market-engine', 'pending'],
  ['verify-operator-session', 'asimog-shell', 'completed'],
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-line bg-panel px-6 py-6 shadow-glow">
          <div className="text-xs uppercase tracking-[0.26em] text-accent">HyperMyths · Solana-first · Desktop-first</div>
          <h1 className="mt-3 text-4xl font-semibold">Private Superbrain Control Surface</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            This web GUI is the browser companion to the Rust CLI and Rust TUI. Keep the intelligence and signing logic local.
            Use the web layer as an operator shell, not as the machine itself.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel title="Node Identity">
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Node:</span> MYTHIV-PRIVATE-BRAIN</div>
              <div><span className="text-muted">Mode:</span> private-superbrain</div>
              <div><span className="text-muted">Cluster:</span> local-solana-first</div>
              <div><span className="text-muted">Operator:</span> desktop session owner</div>
            </div>
          </Panel>

          <Panel title="Markets">
            <div className="space-y-2 text-sm">
              <div>Compute minute quote: <span className="text-accent">stub</span></div>
              <div>Settlement: local ledger first</div>
              <div>Chain integration: Solana adapters next</div>
            </div>
          </Panel>

          <Panel title="Interface Split">
            <div className="space-y-2 text-sm">
              <div>CLI: scripting and automation</div>
              <div>TUI: fast live operator console</div>
              <div>Web GUI: rich local dashboard</div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Services">
            <div className="space-y-3">
              {services.map(([name, status, detail]) => (
                <div key={name} className="rounded-xl border border-line px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-accent">{status}</span>
                  </div>
                  <div className="mt-1 text-muted">{detail}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Tasks">
            <div className="space-y-3">
              {tasks.map(([name, owner, state]) => (
                <div key={name} className="rounded-xl border border-line px-4 py-3 text-sm">
                  <div className="font-medium">{name}</div>
                  <div className="mt-1 text-muted">owner: {owner}</div>
                  <div className="mt-1 text-accent">{state}</div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}
