import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DOMAIN_REGISTRY } from "@hypermythx/protocol";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase() ?? "hypermyths.com";
  const shell = DOMAIN_REGISTRY[host] ?? "local-dev-shell";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hypermythx-shell", shell);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
