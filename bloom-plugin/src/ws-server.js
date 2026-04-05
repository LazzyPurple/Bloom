export const WS_PORT = 8765;

let serverInstance = null;
let activeLogger = console;
let activeCommandHandler = () => {};

const clients = new Set();

function parseMessage(message) {
  if (typeof message !== "string") {
    return message;
  }

  try {
    return JSON.parse(message);
  } catch (_error) {
    return message;
  }
}

function canSend(client) {
  if (!client || typeof client.send !== "function") {
    return false;
  }

  if (typeof client.readyState === "number") {
    return client.readyState === 1;
  }

  return true;
}

function detachClient(client) {
  clients.delete(client);
}

function handleClientMessage(client, event) {
  const payload = event?.data ?? event;
  receive(payload, { client });
}

function attachClient(client) {
  clients.add(client);

  if (typeof client.addEventListener === "function") {
    client.addEventListener("message", (event) => handleClientMessage(client, event));
    client.addEventListener("close", () => detachClient(client));
    client.addEventListener("error", () => detachClient(client));
    return;
  }

  if ("onmessage" in client) {
    client.onmessage = (event) => handleClientMessage(client, event);
  }

  if ("onclose" in client) {
    client.onclose = () => detachClient(client);
  }

  if ("onerror" in client) {
    client.onerror = () => detachClient(client);
  }
}

function normalizeConnectionEvent(event) {
  if (event?.client) {
    return event.client;
  }

  if (event?.detail) {
    return event.detail;
  }

  return event;
}

function bindServer(server) {
  if (typeof server.addEventListener === "function") {
    server.addEventListener("connection", (event) => {
      const client = normalizeConnectionEvent(event);
      attachClient(client);
      activeLogger.info("[Bloom] WebSocket client connected.");
    });
    return;
  }

  if (typeof server.on === "function") {
    server.on("connection", (client) => {
      attachClient(client);
      activeLogger.info("[Bloom] WebSocket client connected.");
    });
    return;
  }

  if ("onconnection" in server) {
    server.onconnection = (event) => {
      const client = normalizeConnectionEvent(event);
      attachClient(client);
      activeLogger.info("[Bloom] WebSocket client connected.");
    };
  }
}

export function createWSServer({ onCommand, logger = console } = {}) {
  activeCommandHandler = typeof onCommand === "function" ? onCommand : () => {};
  activeLogger = logger;

  if (serverInstance) {
    return {
      port: WS_PORT,
      isAvailable: true,
      broadcast,
      receive,
      close,
    };
  }

  const ServerCtor = globalThis.WebSocketServer ?? globalThis.BloomWebSocketServer ?? null;

  if (!ServerCtor) {
    activeLogger.warn(`[Bloom] No WebSocket server runtime found. Stub mode active on ${WS_PORT}.`);
    return {
      port: WS_PORT,
      isAvailable: false,
      broadcast,
      receive,
      close,
    };
  }

  try {
    serverInstance = new ServerCtor({ port: WS_PORT });
    bindServer(serverInstance);
    activeLogger.info(`[Bloom] WebSocket server listening on ${WS_PORT}.`);
  } catch (error) {
    serverInstance = null;
    activeLogger.error("[Bloom] Failed to start WebSocket server.", error);
  }

  return {
    port: WS_PORT,
    isAvailable: Boolean(serverInstance),
    broadcast,
    receive,
    close,
  };
}

export function broadcast(message) {
  const payload = typeof message === "string" ? message : JSON.stringify(message);

  for (const client of [...clients]) {
    if (!canSend(client)) {
      detachClient(client);
      continue;
    }

    try {
      client.send(payload);
    } catch (error) {
      detachClient(client);
      activeLogger.warn("[Bloom] Failed to send message to a WebSocket client.", error);
    }
  }
}

export function receive(message, meta = {}) {
  const parsed = parseMessage(message);

  if (!parsed || typeof parsed !== "object") {
    activeLogger.warn("[Bloom] Ignored invalid WebSocket payload.", parsed);
    return null;
  }

  return activeCommandHandler(parsed, meta);
}

export function close() {
  for (const client of [...clients]) {
    try {
      client.close?.();
    } catch (_error) {
      // Best effort cleanup only.
    }

    detachClient(client);
  }

  try {
    serverInstance?.close?.();
  } catch (_error) {
    // Best effort cleanup only.
  }

  serverInstance = null;
}
