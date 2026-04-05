import { registerLCUEventForwarders } from "./src/events.js";
import { setLCUContext } from "./src/lcu.js";
import { broadcast, createWSServer } from "./src/ws-server.js";

let wsRuntime = null;
let stopForwarders = () => {};
let activeLogger = console;

function handleCommand(command) {
  if (!command || typeof command !== "object") {
    activeLogger.warn("[Bloom] Ignored invalid command payload.", command);
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
      activeLogger.info(`[Bloom] Stub command received: ${command.cmd}`, command);
      return { ok: true, stub: true };
    default:
      activeLogger.warn(`[Bloom] Unknown WebSocket command: ${command.cmd ?? "unknown"}`, command);
      return { ok: false, reason: "unknown-command" };
  }
}

export function init(context) {
  activeLogger = context?.logger ?? console;
  setLCUContext(context);

  stopForwarders();

  if (wsRuntime?.close) {
    wsRuntime.close();
  }

  wsRuntime = createWSServer({
    logger: activeLogger,
    onCommand: handleCommand,
  });

  stopForwarders = registerLCUEventForwarders({
    broadcast,
    logger: activeLogger,
  });

  activeLogger.info("[Bloom] init complete.");
  return wsRuntime;
}

export function load() {
  console.info("[Bloom] Bloom plugin scaffold loaded.");
}
