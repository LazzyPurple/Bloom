import { subscribe } from "./lcu.js";

const EVENT_BINDINGS = [
  {
    event: "OnJsonApiEvent_lol-gameflow_v1_gameflow-phase",
    transform(payload) {
      return {
        type: "gameflow",
        phase: extractGameflowPhase(payload),
      };
    },
  },
  {
    event: "OnJsonApiEvent_lol-champ-select_v1_session",
    transform(payload) {
      return {
        type: "champselect",
        session: extractData(payload),
      };
    },
  },
  {
    event: "OnJsonApiEvent_lol-matchmaking_v1_ready-check",
    transform(payload) {
      return {
        type: "readycheck",
        playerResponse: extractPlayerResponse(payload),
      };
    },
  },
];

function extractData(payload) {
  if (!payload || typeof payload !== "object") {
    return payload ?? null;
  }

  if ("data" in payload) {
    return payload.data;
  }

  return payload;
}

function extractGameflowPhase(payload) {
  const data = extractData(payload);

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && typeof data.phase === "string") {
    return data.phase;
  }

  return "None";
}

function extractPlayerResponse(payload) {
  const data = extractData(payload);

  if (data && typeof data === "object" && typeof data.playerResponse === "string") {
    return data.playerResponse;
  }

  return "None";
}

export function registerLCUEventForwarders({ broadcast, logger = console } = {}) {
  const cleanups = EVENT_BINDINGS.map(({ event, transform }) =>
    subscribe(event, (payload) => {
      try {
        if (typeof broadcast === "function") {
          broadcast(transform(payload));
        }
      } catch (error) {
        logger.warn(`[Bloom] Failed to forward ${event}.`, error);
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
