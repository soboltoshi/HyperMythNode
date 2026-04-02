import Link from 'next/link';
import { getDashboardSnapshot } from '@hypermyths/core';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const dashboard = await getDashboardSnapshot();

  return (
    <main className="wrapper">
      <section className="hero">
        <span className="label">HyperMyths / MYTHIV</span>
        <h1>Session-state worlds, finance routing, agents, and media in one local-first repo.</h1>
        <p>
          This starter turns the uploaded scaffolds into one working dashboard with real server routes,
          local persistence, box boundaries, and Firebase App Hosting-ready layout.
        </p>
      </section>

      <section className="grid">
        <article className="card span-4">
          <h2>Worlds</h2>
          <div className="kpi">{dashboard.counts.worlds}</div>
          <p className="meta">Created through WorldSpawn and indexed through WorldDirectory.</p>
        </article>

        <article className="card span-4">
          <h2>Markets</h2>
          <div className="kpi">{dashboard.counts.markets}</div>
          <p className="meta">MYTHIV market shells and prediction markets.</p>
        </article>

        <article className="card span-4">
          <h2>Media Jobs</h2>
          <div className="kpi">{dashboard.counts.mediaJobs}</div>
          <p className="meta">HashMedia jobs queued through the local store.</p>
        </article>

        <article className="card span-8">
          <h2>World directory</h2>
          <div className="list">
            {dashboard.worlds.map((world) => (
              <Link className="item" key={world.id} href={`/worlds/${world.slug}`}>
                <div className="row">
                  <strong>{world.title}</strong>
                  <span className="label">{world.type}</span>
                  <span className="label">{world.status}</span>
                </div>
                <p className="meta">Slug: {world.slug}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="card span-4">
          <h2>Session snapshot</h2>
          <pre>{JSON.stringify(dashboard.session, null, 2)}</pre>
        </article>

        <article className="card span-6">
          <h2>Open markets</h2>
          <div className="list">
            {dashboard.markets.map((market) => (
              <div className="item" key={market.id}>
                <div className="row">
                  <strong>{market.subject}</strong>
                  <span className="label">{market.status}</span>
                </div>
                <p className="meta">{market.choices.join(' / ')}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-6">
          <h2>Agent mesh</h2>
          <div className="list">
            {dashboard.tasks.map((task) => (
              <div className="item" key={task.id}>
                <div className="row">
                  <strong>{task.type}</strong>
                  <span className="label">{task.status}</span>
                </div>
                <p className="meta">Agent: {task.agentId}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-12">
          <h2>Starter API routes</h2>
          <div className="row">
            <span className="label">GET /api/health</span>
            <span className="label">GET, POST /api/worlds</span>
            <span className="label">GET /api/worlds/[slug]</span>
            <span className="label">GET, POST /api/session</span>
            <span className="label">GET, POST /api/markets</span>
            <span className="label">GET, POST /api/media</span>
          </div>
        </article>
      </section>
    </main>
  );
}
