import { DOMAIN_REGISTRY, type DomainShell } from "@hypermythx/protocol";

export function getShellFromHost(host?: string | null): DomainShell {
  const normalized = (host ?? process.env.NEXT_PUBLIC_DEFAULT_DOMAIN ?? "hypermyths.com").split(":")[0].toLowerCase();
  return DOMAIN_REGISTRY[normalized] ?? "local-dev-shell";
}
