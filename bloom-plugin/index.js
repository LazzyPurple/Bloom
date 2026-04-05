import { registerLCUEventForwarders } from "./src/events.js";
import { setLCUContext } from "./src/lcu.js";
import { broadcast, createWSServer } from "./src/ws-server.js";

let stopForwarders = () => {};

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

export function init(context) {
  setLCUContext(context);
  stopForwarders();

  createWSServer({ onCommand: handleCommand });
  stopForwarders = registerLCUEventForwarders({ broadcast });

  console.info("[Bloom] init complete. context.socket:", typeof context?.socket);
}

export function load() {
  console.info("[Bloom] Plugin loaded.");
}
