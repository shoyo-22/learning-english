import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readManagedConfig, writeManagedConfig } from "./local-config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cli = resolve(
  dirname(require.resolve("supabase/package.json")),
  "dist/supabase.js",
);
const network = "english-lab-local";
const action = process.argv[2];

function command(
  executable,
  args,
  { optional = false, progress = false } = {},
) {
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", progress ? "inherit" : "pipe"],
  });
  if (!optional && (result.error || result.status !== 0))
    throw new Error(
      `${executable === process.execPath ? "Supabase CLI" : executable} ${args[0]} failed. Run docker info to see Docker errors; check that Docker Desktop is running and ports 54321–54323 are free. No cloud project is used.`,
    );
  return result;
}
function supabase(args, options) {
  return command(process.execPath, [cli, ...args, "--agent", "no"], options)
    .stdout;
}
function ensureNetwork() {
  command("docker", ["info", "--format", "{{.ServerVersion}}"]);
  let result = command("docker", ["network", "inspect", network], {
    optional: true,
  });
  if (result.status !== 0) {
    command("docker", [
      "network",
      "create",
      "--driver",
      "bridge",
      "--opt",
      "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
      network,
    ]);
    result = command("docker", ["network", "inspect", network]);
  }
  const item = JSON.parse(result.stdout)[0];
  if (
    item.Driver !== "bridge" ||
    item.Options?.["com.docker.network.bridge.host_binding_ipv4"] !==
      "127.0.0.1"
  )
    throw new Error(
      "The existing english-lab-local Docker network is not bound to loopback. It was not modified. Ask the teacher to resolve the network name conflict.",
    );
}
function reportPortBindings() {
  const ids = command("docker", [
    "ps",
    "--filter",
    `network=${network}`,
    "--format",
    "{{.ID}}",
  ])
    .stdout.trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!ids.length)
    throw new Error("No running local Supabase containers were found.");
  const containers = JSON.parse(command("docker", ["inspect", ...ids]).stdout);
  for (const container of containers)
    for (const bindings of Object.values(container.NetworkSettings.Ports || {}))
      for (const binding of bindings || [])
        if (binding.HostIp !== "127.0.0.1" && binding.HostIp !== "::1")
          return console.warn(
            "Docker publishes local Supabase ports on network interfaces despite the loopback network setting. This is a local TEST database with public test credentials. Use it only on a trusted private computer/network; use setup:demo on shared or public networks. Details: docs/TEST_CREDENTIALS.ru.md",
          );
  console.log("Verified: local Supabase ports are bound to loopback.");
}
try {
  if (action === "demo") {
    await writeManagedConfig(root, "demo");
    console.log(
      "Demo settings saved to .env.local. No accounts or API keys are needed. Next: npm run dev:local",
    );
  } else if (action === "local" || action === "start") {
    if (action === "local") await readManagedConfig(root);
    ensureNetwork();
    console.log(
      "Starting local Supabase. The first run downloads Docker images and can take several minutes.",
    );
    supabase(["start", "--network-id", network], { progress: true });
    reportPortBindings();
    supabase(["migration", "up", "--local"], { progress: true });
    if (action === "local") {
      const status = JSON.parse(supabase(["status", "-o", "json"]));
      await writeManagedConfig(root, "local", status);
      console.log(
        "Local database settings saved to .env.local. Keys are not printed. Next: npm run db:check, then npm run dev:local",
      );
    } else
      console.log(
        "Local database started; pending migrations applied. Existing .env.local was not changed.",
      );
  } else if (action === "stop") {
    supabase(["stop"], { progress: true });
    console.log(
      "Local Supabase stopped. Its data is retained. Restart with npm run db:local:start.",
    );
  } else
    throw new Error(
      "Use npm run setup:demo, setup:local, db:local:start, or db:local:stop.",
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
