import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseEnv } from "node:util";
import {
  configValues,
  demoSecret,
  writeManagedConfig,
} from "../scripts/local-config.mjs";

const status = {
  API_URL: "http://127.0.0.1:54321",
  SECRET_KEY: "sb_secret_local_fixture",
};
async function withDirectory(run: (directory: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "english-lab-setup-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("local setup preserves an existing private configuration and refuses cloud destinations", async () => {
  await withDirectory(async (directory) => {
    const original =
      "SUPABASE_URL=https://example.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=private-fixture\n";
    await writeFile(join(directory, ".env.local"), original);
    await assert.rejects(writeManagedConfig(directory, "demo"), /preserved/);
    assert.equal(
      await readFile(join(directory, ".env.local"), "utf8"),
      original,
    );
  });
  assert.throws(
    () =>
      configValues("local", {
        ...status,
        API_URL: "https://example.supabase.co",
      }),
    /loopback/,
  );
  assert.throws(
    () =>
      configValues("local", {
        ...status,
        SECRET_KEY: "sb_publishable_fixture",
      }),
    /server key/,
  );
  assert.throws(
    () =>
      configValues("local", {
        ...status,
        SECRET_KEY: "sb_secret_bad\nAPP_URL=x",
      }),
    /server key/,
  );
});

test("switching managed local modes retains browser signing identity and private local keys", async () => {
  await withDirectory(async (directory) => {
    await writeManagedConfig(directory, "demo");
    let config = parseEnv(
      await readFile(join(directory, ".env.local"), "utf8"),
    );
    assert.equal(config.SESSION_SECRET, demoSecret);
    assert.equal(config.SUPABASE_URL, "");
    await writeManagedConfig(directory, "local", status);
    config = parseEnv(await readFile(join(directory, ".env.local"), "utf8"));
    assert.equal(config.SESSION_SECRET, demoSecret);
    assert.equal(config.SUPABASE_SERVICE_ROLE_KEY, status.SECRET_KEY);
    assert.equal(config.APP_URL, "");
    await writeManagedConfig(directory, "demo");
    config = parseEnv(await readFile(join(directory, ".env.local"), "utf8"));
    assert.equal(config.SUPABASE_SERVICE_ROLE_KEY, "");
    assert.equal(config.SESSION_SECRET, demoSecret);
  });
  const first = configValues("local", status);
  assert.equal(first.SESSION_SECRET.length, 64);
  assert.notEqual(
    first.SESSION_SECRET,
    configValues("local", status).SESSION_SECRET,
  );
  const legacy = configValues("local", {
    API_URL: status.API_URL,
    SERVICE_ROLE_KEY: "header.payload.signature",
  });
  assert.equal(legacy.SUPABASE_SERVICE_ROLE_KEY, "header.payload.signature");
});

test(
  "a local settings symlink is not followed or overwritten",
  { skip: process.platform === "win32" },
  async () => {
    await withDirectory(async (directory) => {
      const original = join(directory, "private-settings");
      await writeFile(original, "unchanged");
      await symlink(original, join(directory, ".env.local"));
      await assert.rejects(
        writeManagedConfig(directory, "demo"),
        /regular file/,
      );
      assert.equal(await readFile(original, "utf8"), "unchanged");
    });
  },
);
