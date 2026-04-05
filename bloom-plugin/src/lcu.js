let runtimeContext = null;

export function setLCUContext(context) {
  runtimeContext = context ?? null;
}

export async function lcuFetch(method, path, body) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(normalized, init);

  if (!response.ok) {
    throw new Error(`[Bloom] LCU ${method} ${path} -> ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.headers.get("content-type")?.includes("application/json")
    ? response.json()
    : response.text();
}

export function subscribe(eventPath, callback) {
  const socket = runtimeContext?.socket;

  if (!socket?.observe) {
    console.warn("[Bloom] context.socket.observe() unavailable for", eventPath);
    return () => {};
  }

  const subscription = socket.observe(eventPath, callback);
  return typeof subscription?.disconnect === "function"
    ? () => subscription.disconnect()
    : () => {};
}
