import { registerLCUEventForwarders } from "./src/events.js";
import { setLCUContext } from "./src/lcu.js";
import { broadcast, createWSServer } from "./src/ws-server.js";

const BRIDGE_HTTP = "http://127.0.0.1:9000";
const POLL_INTERVAL_MS = 500;

let stopForwarders = () => {};
let pollTimer = null;

function handleCommand(command) {
  if (!command || typeof command !== "object") {
    return null;
  }

  switch (command.cmd) {
    case "ping":
      broadcast({ type: "pong" });
      return { ok: true };
    case "accept":
    case "createLobby":
    case "startSearch":
    case "stopSearch":
    case "lockChamp":
      console.info("[Bloom] Stub cmd:", command.cmd, command);
      return { ok: true, stub: true };
    default:
      console.warn("[Bloom] Unknown cmd:", command.cmd);
      return { ok: false, reason: "unknown-command" };
  }
}

function stopCommandPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startCommandPolling() {
  stopCommandPolling();

  pollTimer = setInterval(async () => {
    try {
      const response = await fetch(`${BRIDGE_HTTP}/commands`);

      if (!response.ok) {
        return;
      }

      const commands = await response.json();

      if (!Array.isArray(commands) || commands.length === 0) {
        return;
      }

      console.info("[Bloom] Commands received from bridge:", commands.length);

      for (const command of commands) {
        handleCommand(command);
      }
    } catch (_error) {
      // Bridge unavailable, wait for next tick.
    }
  }, POLL_INTERVAL_MS);
}

export function init(context) {
  setLCUContext(context);
  stopForwarders();
  stopCommandPolling();

  createWSServer({ onCommand: handleCommand });
  startCommandPolling();
  stopForwarders = registerLCUEventForwarders({ broadcast });

  console.info("[Bloom] init complete. context.socket:", typeof context?.socket);
}

export function load() {
  console.info("[Bloom] Plugin loaded.");
}
