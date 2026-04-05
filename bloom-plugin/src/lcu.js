let runtimeContext = null;

export function setLCUContext(context) {
  runtimeContext = context ?? null;
}

function getLogger() {
  return runtimeContext?.logger ?? console;
}

function normalizePath(path) {
  if (typeof path !== "string" || path.length === 0) {
    throw new Error("[Bloom] LCU path must be a non-empty string.");
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export async function lcuFetch(method, path, body) {
  if (typeof fetch !== "function") {
    throw new Error("[Bloom] fetch() is unavailable in this Pengu runtime.");
  }

  const requestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(normalizePath(path), requestInit);

  if (!response.ok) {
    throw new Error(`[Bloom] LCU request failed: ${method} ${path} -> ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function subscribe(eventName, callback) {
  const socket = runtimeContext?.socket;

  if (!socket) {
    getLogger().warn(`[Bloom] context.socket unavailable for ${eventName}.`);
    return () => {};
  }

  if (typeof socket.subscribe === "function") {
    const subscription = socket.subscribe(eventName, callback);

    if (typeof subscription === "function") {
      return subscription;
    }

    if (subscription && typeof subscription.unsubscribe === "function") {
      return () => subscription.unsubscribe();
    }

    return () => {};
  }

  if (typeof socket.on === "function") {
    socket.on(eventName, callback);

    if (typeof socket.off === "function") {
      return () => socket.off(eventName, callback);
    }

    return () => {};
  }

  if (typeof socket.addEventListener === "function") {
    socket.addEventListener(eventName, callback);

    if (typeof socket.removeEventListener === "function") {
      return () => socket.removeEventListener(eventName, callback);
    }

    return () => {};
  }

  getLogger().warn(`[Bloom] No compatible subscription API found for ${eventName}.`);
  return () => {};
}
