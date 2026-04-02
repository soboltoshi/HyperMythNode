import { listAgentTasks } from './agents';
import { listPredictionMarkets } from './markets';
import { listMediaJobs } from './media';
import { getSessionSnapshot } from './session';
import { listWorlds } from './worlds';

export async function getDashboardSnapshot() {
  const [worlds, session, markets, mediaJobs, tasks] = await Promise.all([
    listWorlds(),
    getSessionSnapshot(),
    listPredictionMarkets(),
    listMediaJobs(),
    listAgentTasks()
  ]);

  return {
    worlds,
    session,
    markets,
    mediaJobs,
    tasks,
    counts: {
      worlds: worlds.length,
      markets: markets.length,
      mediaJobs: mediaJobs.length,
      tasks: tasks.length
    }
  };
}
