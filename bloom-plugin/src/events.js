import { subscribe } from "./lcu.js";

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
        if (typeof broadcast === "function") {
          broadcast(transform(payload));
        }
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
