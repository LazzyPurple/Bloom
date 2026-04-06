import { startTransition, useEffect, useRef, useState } from "react";

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export enum ConnectionState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}

export type BloomEvent =
  | { type: "bridge_ready" }
  | { type: "gameflow"; phase: string }
  | { type: "champselect"; session: unknown }
  | { type: "readycheck"; playerResponse: string }
  | { type: "unknown"; raw: unknown };

export type BloomCommand =
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
  const reconnectTimeoutRef = useRef<number | null>(null);
  const currentIpRef = useRef("");
  const intentionalDisconnectRef = useRef(false);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const [state, setState] = useState(ConnectionState.Disconnected);
  const [lastEvent, setLastEvent] = useState<BloomEvent | null>(null);

  function clearReconnectTimer() {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }

  function disposeSocket(socket: WebSocket | null) {
    if (!socket) {
      return;
    }

    socket.onopen = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    socket.close();
  }

  function scheduleReconnect() {
    clearReconnectTimer();

    if (intentionalDisconnectRef.current || !currentIpRef.current) {
      setState(ConnectionState.Disconnected);
      return;
    }

    const delay = reconnectDelayRef.current;
    reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);

    setState(ConnectionState.Connecting);
    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectTimeoutRef.current = null;
      openSocket(currentIpRef.current);
    }, delay);
  }

  function openSocket(ip: string) {
    const url = buildSocketUrl(ip);

    if (!url) {
      setState(ConnectionState.Disconnected);
      return false;
    }

    currentIpRef.current = ip.trim();
    clearReconnectTimer();
    disposeSocket(socketRef.current);

    const socket = new WebSocket(url);
    socketRef.current = socket;
    setState(ConnectionState.Connecting);

    socket.onopen = () => {
      if (socketRef.current !== socket) {
        return;
      }

      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
      setState(ConnectionState.Connected);
    };

    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (intentionalDisconnectRef.current) {
        setState(ConnectionState.Disconnected);
        return;
      }

      scheduleReconnect();
    };

    socket.onerror = () => {
      if (socketRef.current === socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket || typeof event.data !== "string") {
        return;
      }

      startTransition(() => {
        setLastEvent(parseEventPayload(event.data));
      });
    };

    return true;
  }

  function connect(ip: string) {
    intentionalDisconnectRef.current = false;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
    return openSocket(ip);
  }

  function disconnect() {
    intentionalDisconnectRef.current = true;
    currentIpRef.current = "";
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
    clearReconnectTimer();

    const socket = socketRef.current;
    socketRef.current = null;
    disposeSocket(socket);
    setState(ConnectionState.Disconnected);
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
      intentionalDisconnectRef.current = true;
      clearReconnectTimer();
      disposeSocket(socketRef.current);
      socketRef.current = null;
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
