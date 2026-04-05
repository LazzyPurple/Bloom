import { subscribe } from "./lcu.js";

const BRIDGE_HTTP = "http://127.0.0.1:9000";

const EVENT_BINDINGS = [
  {
    path: "lol-gameflow/v1/gameflow-phase",
    transform(data) {
      return {
        type: "gameflow",
        phase: typeof data?.data === "string" ? data.data : "None",
      };
    },
  },
  {
    path: "lol-champ-select/v1/session",
    transform(data) {
      return {
        type: "champselect",
        session: data?.data ?? null,
      };
    },
  },
  {
    path: "lol-matchmaking/v1/ready-check",
    transform(data) {
      return {
        type: "readycheck",
        playerResponse: data?.data?.playerResponse ?? "None",
      };
    },
  },
];

export function registerLCUEventForwarders({ broadcast, logger = console } = {}) {
  const cleanups = EVENT_BINDINGS.map(({ path, transform }) =>
    subscribe(path, (payload) => {
      try {
        const event = transform(payload);

        fetch(`${BRIDGE_HTTP}/event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }).catch((error) => {
          logger.warn("[Bloom] Bridge unreachable, event dropped:", error.message);
        });
      } catch (error) {
        logger.warn(`[Bloom] Failed to forward ${path}.`, error);
      }
    }),
  );

  return () => {
    for (const cleanup of cleanups) {
      if (typeof cleanup === "function") {
        cleanup();
      }
    }
  };
}
