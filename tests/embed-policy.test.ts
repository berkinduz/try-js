import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

interface HeaderEntry {
  key: string;
  value: string;
}

interface HeaderRule {
  source: string;
  headers: HeaderEntry[];
}

function headerValue(rule: HeaderRule, key: string): string | undefined {
  return rule.headers.find((header) => header.key === key)?.value;
}

test("generated embeds use the dedicated route and a constrained sandbox", async () => {
  const vite = await createServer({ server: { middlewareMode: true } });

  try {
    const { generateEmbedCode } = await vite.ssrLoadModule("/src/utils/share.ts");
    const embed = generateEmbedCode({
      code: "console.log('embedded');",
      language: "javascript",
    });

    assert.match(embed, /src="https:\/\/tryjs\.app\/embed#code=/);
    assert.match(
      embed,
      /sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"/,
    );
    assert.match(embed, /title="TryJS code playground"/);
    assert.doesNotMatch(embed, /\?embed=1/);
  } finally {
    await vite.close();
  }
});

test("Vercel keeps regular pages same-origin while allowing the embed route", async () => {
  const config = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ) as { headers: HeaderRule[] };

  const embedPolicy = config.headers.find(
    (rule) => rule.source === "/embed",
  );
  const regularPagePolicy = config.headers.find(
    (rule) => rule.source === "/((?!embed$).*)",
  );
  const permissivePolicies = config.headers.filter(
    (rule) => headerValue(rule, "Content-Security-Policy") === "frame-ancestors *",
  );

  assert.ok(embedPolicy, "the dedicated embed route must have its own policy");
  assert.deepEqual(
    permissivePolicies.map((rule) => rule.source),
    ["/embed"],
    "no wildcard or sibling route may inherit the permissive frame policy",
  );
  assert.equal(
    headerValue(embedPolicy, "Content-Security-Policy"),
    "frame-ancestors *",
  );
  assert.equal(headerValue(embedPolicy, "X-Frame-Options"), undefined);
  assert.equal(headerValue(embedPolicy, "X-Content-Type-Options"), "nosniff");

  assert.ok(regularPagePolicy, "regular pages must retain framing protection");
  assert.equal(
    headerValue(regularPagePolicy, "Content-Security-Policy"),
    "frame-ancestors 'self'",
  );
  assert.equal(
    headerValue(regularPagePolicy, "X-Frame-Options"),
    "SAMEORIGIN",
  );
});
