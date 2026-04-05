import { useEffect, useRef, useState } from "react";

export enum ConnectionState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}

export type BloomEvent =
  | { type: "gameflow"; phase: string }
  | { type: "champselect"; session: unknown }
  | { type: "readycheck"; playerResponse: string }
  | { type: "pong" }
  | { type: "unknown"; raw: unknown };

export type BloomCommand =
  | { cmd: "ping" }
  | { cmd: "accept" }
  | { cmd: "createLobby"; queueId: number }
  | { cmd: "startSearch" }
  | { cmd: "stopSearch" }
  | { cmd: "lockChamp"; championId: number };

export type UseBloomWSResult = {
  connect: (ip: string) => boolean;
  disconnect: () => void;
  send: (command: BloomCommand) => boolean;
  state: ConnectionState;
  lastEvent: BloomEvent | null;
};

function buildSocketUrl(ip: string): string | null {
  const trimmed = ip.trim();

  if (!trimmed) {
    return null;
  }

  const candidate = /^wss?:\/\//i.test(trimmed) ? trimmed : `ws://${trimmed}`;

  try {
    const url = new URL(candidate);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.port = url.port || "8765";
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (_error) {
    return null;
  }
}

function parseEventPayload(payload: string): BloomEvent {
  try {
    const parsed = JSON.parse(payload) as BloomEvent;

    if (parsed && typeof parsed === "object" && "type" in parsed) {
      return parsed;
    }

    return { type: "unknown", raw: parsed };
  } catch (_error) {
    return { type: "unknown", raw: payload };
  }
}

export function useBloomWS(): UseBloomWSResult {
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState(ConnectionState.Disconnected);
  const [lastEvent, setLastEvent] = useState<BloomEvent | null>(null);

  function disconnect() {
    const socket = socketRef.current;
    socketRef.current = null;

    if (socket) {
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.close();
    }

    setState(ConnectionState.Disconnected);
  }

  function connect(ip: string) {
    const url = buildSocketUrl(ip);

    if (!url) {
      setState(ConnectionState.Disconnected);
      return false;
    }

    if (socketRef.current) {
      disconnect();
    }

    setState(ConnectionState.Connecting);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current === socket) {
        setState(ConnectionState.Connected);
      }
    };

    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setState(ConnectionState.Disconnected);
    };

    socket.onerror = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setState(ConnectionState.Disconnected);
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket || typeof event.data !== "string") {
        return;
      }

      setLastEvent(parseEventPayload(event.data));
    };

    return true;
  }

  function send(command: BloomCommand) {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(command));
    return true;
  }

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    send,
    state,
    lastEvent,
  };
}
