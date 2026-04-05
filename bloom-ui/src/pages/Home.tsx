import { ConnectionState, type BloomCommand, type BloomEvent } from "../hooks/useBloomWS";

type HomeProps = {
  disconnect: () => void;
  lastEvent: BloomEvent | null;
  send: (command: BloomCommand) => boolean;
  state: ConnectionState;
};

const COMMANDS: Array<{ label: string; command: BloomCommand }> = [
  { label: "Ping", command: { cmd: "ping" } },
  { label: "Accept", command: { cmd: "accept" } },
  { label: "Create SoloQ Lobby", command: { cmd: "createLobby", queueId: 420 } },
  { label: "Start Search", command: { cmd: "startSearch" } },
  { label: "Stop Search", command: { cmd: "stopSearch" } },
  { label: "Lock Yasuo", command: { cmd: "lockChamp", championId: 157 } },
];

export default function Home({ disconnect, lastEvent, send, state }: HomeProps) {
  const serializedEvent = lastEvent
    ? JSON.stringify(lastEvent, null, 2)
    : "No Bloom events received yet.";

  return (
    <section className="w-full space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-bloom-950/30 backdrop-blur">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-bloom-200">Home</p>
        <h2 className="text-2xl font-semibold text-white">Scaffold control surface</h2>
        <p className="text-sm leading-6 text-slate-300">
          The commands below hit WebSocket stubs only. No LCU gameplay logic is implemented yet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {COMMANDS.map((entry) => (
          <button
            key={entry.label}
            type="button"
            onClick={() => send(entry.command)}
            disabled={state !== ConnectionState.Connected}
            className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-bloom-400/60 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">Last event</p>
        <pre className="overflow-x-auto text-xs leading-6 text-slate-200">{serializedEvent}</pre>
      </div>

      <button
        type="button"
        onClick={disconnect}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
      >
        Disconnect
      </button>
    </section>
  );
}
