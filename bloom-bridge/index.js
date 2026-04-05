import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const HTTP_PORT = 9000;
const WS_PORT = 8765;
const HTTP_HOST = "127.0.0.1";

const pendingCommands = [];
const wsClients = new Set();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

function broadcast(message) {
  const payload = JSON.stringify(message);

  for (const client of [...wsClients]) {
    if (client.readyState !== WebSocket.OPEN) {
      wsClients.delete(client);
      continue;
    }

    try {
      client.send(payload);
    } catch (error) {
      wsClients.delete(client);
      console.warn("[Bridge] Failed to broadcast to a client:", error.message);
    }
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

const wsServer = new WebSocketServer({
  host: "0.0.0.0",
  port: WS_PORT,
});

wsServer.on("connection", (socket) => {
  wsClients.add(socket);
  socket.send(JSON.stringify({ type: "bridge_ready" }));

  socket.on("message", (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      pendingCommands.push(parsed);
    } catch (error) {
      console.warn("[Bridge] Dropped invalid WS payload:", error.message);
    }
  });

  socket.on("close", () => {
    wsClients.delete(socket);
  });

  socket.on("error", () => {
    wsClients.delete(socket);
  });
});

const httpServer = http.createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const url = request.url ?? "/";

  if (method === "POST" && url === "/event") {
    try {
      const event = await readJsonBody(request);
      broadcast(event);
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: `invalid-json: ${error.message}`,
      });
    }
    return;
  }

  if (method === "GET" && url === "/commands") {
    const drainedCommands = pendingCommands.splice(0, pendingCommands.length);
    sendJson(response, 200, drainedCommands);
    return;
  }

  if (method === "GET" && url === "/health") {
    sendJson(response, 200, {
      status: "ok",
      clients: wsClients.size,
      pendingCommands: pendingCommands.length,
    });
    return;
  }

  sendJson(response, 404, {
    ok: false,
    error: "not-found",
  });
});

httpServer.listen(HTTP_PORT, HTTP_HOST, () => {
  console.info(`[Bridge] HTTP IPC listening on ${HTTP_HOST}:${HTTP_PORT}`);
});

console.info(`[Bridge] WebSocket LAN listening on 0.0.0.0:${WS_PORT}`);
