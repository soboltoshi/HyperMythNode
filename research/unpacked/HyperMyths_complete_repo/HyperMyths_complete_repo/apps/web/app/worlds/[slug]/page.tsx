import { notFound } from 'next/navigation';
import { getWorldBySlug, listMediaJobsForTarget, listPredictionMarkets } from '@hypermyths/core';

export const dynamic = 'force-dynamic';

export default async function WorldPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);

  if (!world) {
    notFound();
  }

  const markets = await listPredictionMarkets();
  const mediaJobs = await listMediaJobsForTarget(world.id);

  return (
    <main className="wrapper">
      <section className="hero">
        <span className="label">World detail</span>
        <h1>{world.title}</h1>
        <p>
          This page shows one world, plus related market and media state, using shared core services.
        </p>
      </section>

      <section className="grid">
        <article className="card span-6">
          <h2>World</h2>
          <pre>{JSON.stringify(world, null, 2)}</pre>
        </article>

        <article className="card span-6">
          <h2>Markets</h2>
          <pre>{JSON.stringify(markets.filter((m) => m.worldId === world.id), null, 2)}</pre>
        </article>

        <article className="card span-12">
          <h2>Media jobs</h2>
          <pre>{JSON.stringify(mediaJobs, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
