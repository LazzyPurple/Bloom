import { ConnectionState } from "../hooks/useBloomWS";

type StatusBadgeProps = {
  state: ConnectionState;
};

const LABELS: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "Disconnected",
  [ConnectionState.Connecting]: "Connecting",
  [ConnectionState.Connected]: "Connected",
};

const STYLES: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  [ConnectionState.Connecting]: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  [ConnectionState.Connected]: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${STYLES[state]}`}
    >
      {LABELS[state]}
    </span>
  );
}
