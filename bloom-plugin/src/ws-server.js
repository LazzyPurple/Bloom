export const WS_PORT = 8765;

const clients = new Set();
let activeCommandHandler = () => {};

console.info("[Bloom] ws-server stub mode. Real WS server will be in bloom-bridge/ (phase 2).");

export function createWSServer({ onCommand } = {}) {
  activeCommandHandler = typeof onCommand === "function" ? onCommand : () => {};
  return {
    port: WS_PORT,
    isAvailable: false,
    broadcast,
    receive,
    close,
  };
}

export function broadcast(message) {
  console.debug(
    "[Bloom] broadcast (stub):",
    typeof message === "string" ? message : JSON.stringify(message),
  );
}

export function receive(message) {
  try {
    const parsed = typeof message === "string" ? JSON.parse(message) : message;
    return activeCommandHandler(parsed);
  } catch (_error) {
    return null;
  }
}

export function close() {
  clients.clear();
}
