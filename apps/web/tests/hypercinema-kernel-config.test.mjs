import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("hypercinema page reads NEXT_PUBLIC_KERNEL_URL", () => {
  const filePath = path.join(process.cwd(), "app", "hypercinema", "page.tsx");
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes("NEXT_PUBLIC_KERNEL_URL"),
    "Expected hypercinema page to support NEXT_PUBLIC_KERNEL_URL"
  );
  assert.ok(
    content.includes("DEFAULT_KERNEL"),
    "Expected hypercinema page to keep a localhost fallback"
  );
});
