import { headers } from "next/headers";
import { getShellFromHost } from "../lib/domains";
import { DOMAIN_REGISTRY, WALLET_SLOTS, ADAPTER_REGISTRY } from "@hypermythx/protocol";

export default async function HomePage() {
  const host = (await headers()).get("host");
  const shell = getShellFromHost(host);

  return (
    <main>
      <span className="badge">Next.js App Router starter</span>
      <h1>HyperMythX Combined SuperAssembly Starter</h1>
      <p>
        Resolved shell: <strong>{shell}</strong>. This repo keeps the VR Superbrain separate from the desktop execution
        agent and starts the web layer in real Next.js instead of a plain Node stub.
      </p>

      <div className="grid">
        <section className="card">
          <h2>Locked domains</h2>
          <table>
            <tbody>
              {Object.entries(DOMAIN_REGISTRY).map(([domain, view]) => (
                <tr key={domain}>
                  <td><code>{domain}</code></td>
                  <td>{view}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Agent wallet slots</h2>
          <ul>
            {WALLET_SLOTS.map((slot) => (
              <li key={slot}><code>{slot}</code></li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Adapter lock</h2>
          <p>Locked adapters: <strong>{ADAPTER_REGISTRY.length}</strong></p>
          <p>First adapters: {ADAPTER_REGISTRY.slice(0, 6).join(", ")}</p>
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Run paths</h2>
        <p><code>pnpm dev</code> for web, <code>pnpm start:supernode</code> for the JS supernode, <code>pnpm run:rust</code> for Rust runtime, and <code>pnpm build:c</code> for the C runtime.</p>
      </section>
    </main>
  );
}
