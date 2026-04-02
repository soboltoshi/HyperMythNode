"use client";

import { useEffect, useMemo, useState } from 'react'
import { Panel } from '@/components/Panel'

type Snapshot = {
  current_tick: number
  whitelist_enabled: boolean
  whitelisted_trader_count: number
  node_count: number
  job_count: number
  quote_count: number
  fill_count: number
  settlement_total: number
  quote_currency: string
  asimog: { private_brain_role: string; public_brain_role: string; backend_role: string; market_charter: string }
  clawmog: { frontend_role: string; operator_shell_role: string; public_surface_role: string }
  fills: Array<{ id: string; job_owner_address: string; node_operator_address: string; total: number }>
  whitelist?: { allowed_trader_addresses: string[]; allowed_node_operator_addresses: string[] } | null
}

const API_BASE = process.env.NEXT_PUBLIC_SUPERBRAIN_API_BASE || 'http://127.0.0.1:8787'

export function LiveMarketConsole() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function loadStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/status`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      setSnapshot(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown API error')
    } finally {
      setLoading(false)
    }
  }

  async function mutate(path: string) {
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: 'POST' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      await loadStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mutation failed')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadStatus()
    const timer = setInterval(loadStatus, 3000)
    return () => clearInterval(timer)
  }, [])

  const metrics = useMemo(() => {
    if (!snapshot) return []
    return [
      ['Tick', String(snapshot.current_tick)],
      ['Whitelist', snapshot.whitelist_enabled ? 'Enabled' : 'Disabled'],
      ['Traders', String(snapshot.whitelisted_trader_count)],
      ['Nodes', String(snapshot.node_count)],
      ['Jobs', String(snapshot.job_count)],
      ['Quotes', String(snapshot.quote_count)],
      ['Fills', String(snapshot.fill_count)],
      ['Settlement total', `${snapshot.settlement_total.toFixed(2)} ${snapshot.quote_currency}`],
    ]
  }, [snapshot])

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-line bg-panel px-6 py-6 shadow-glow">
          <div className="text-xs uppercase tracking-[0.26em] text-accent">HyperMyths · Live Local API · ClawMOG Shell · AsiMOG Brain</div>
          <h1 className="mt-3 text-4xl font-semibold">ClawMOG Frontend for the AsiMOG Compute Exchange</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            This web shell now reads the live local Rust API. ClawMOG presents the market. AsiMOG runs
            private policy, public narration, backend exchange flow, and settlement preparation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={busy} onClick={() => mutate('/api/tick')} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-accent disabled:opacity-50">Advance 1 tick</button>
            <button disabled={busy} onClick={() => mutate('/api/loop?ticks=5')} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-accent disabled:opacity-50">Advance 5 ticks</button>
            <button disabled={busy} onClick={() => mutate('/api/reset')} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-accent disabled:opacity-50">Reset exchange</button>
          </div>
          <div className="mt-4 text-xs text-muted">API base: {API_BASE}</div>
          {error && <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">API error: {error}</div>}
        </header>

        {loading && <Panel title="Loading"><div className="text-sm text-muted">Waiting for local API...</div></Panel>}

        {!!snapshot && (
          <>
            <section className="grid gap-6 lg:grid-cols-4">
              {metrics.map(([label, value]) => (
                <Panel key={label} title={label}>
                  <div className="text-2xl font-semibold">{value}</div>
                </Panel>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Panel title="AsiMOG Mandate">
                <div className="space-y-3 text-sm text-muted">
                  <p>{snapshot.asimog.private_brain_role}</p>
                  <p>{snapshot.asimog.public_brain_role}</p>
                  <p>{snapshot.asimog.backend_role}</p>
                </div>
              </Panel>
              <Panel title="ClawMOG Mandate">
                <div className="space-y-2 text-sm">
                  <div>{snapshot.clawmog.frontend_role}</div>
                  <div>{snapshot.clawmog.operator_shell_role}</div>
                  <div>{snapshot.clawmog.public_surface_role}</div>
                </div>
              </Panel>
              <Panel title="Market Charter">
                <div className="space-y-2 text-sm">
                  <div>{snapshot.asimog.market_charter}</div>
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Whitelisted Traders">
                <div className="space-y-3 text-sm">
                  {(snapshot.whitelist?.allowed_trader_addresses || []).map((entry) => (
                    <div key={entry} className="rounded-xl border border-line px-4 py-3 text-accent">{entry}</div>
                  ))}
                </div>
              </Panel>
              <Panel title="Recent Fills">
                <div className="space-y-3 text-sm">
                  {snapshot.fills.slice(0, 8).map((fill) => (
                    <div key={fill.id} className="rounded-xl border border-line px-4 py-3">
                      <div className="font-medium">{fill.job_owner_address} → {fill.node_operator_address}</div>
                      <div className="mt-2 text-muted">accepted fill · ask {fill.total.toFixed(2)} {snapshot.quote_currency}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
