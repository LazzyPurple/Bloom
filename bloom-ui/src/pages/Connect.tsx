import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { ConnectionState } from "../hooks/useBloomWS";

type ConnectProps = {
  connect: (ip: string) => boolean;
  state: ConnectionState;
};

const STORAGE_KEY = "bloom:last-ip";

function getInitialIp() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export default function Connect({ connect, state }: ConnectProps) {
  const navigate = useNavigate();
  const [ip, setIp] = useState(getInitialIp);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (state === ConnectionState.Connected) {
      navigate("/home", { replace: true });
    }
  }, [navigate, state]);

  useEffect(() => {
    const cleanedIp = ip.trim();

    if (!cleanedIp) {
      setQrCodeUrl("");
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(`http://${cleanedIp}:5173`, {
      width: 160,
      margin: 1,
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrCodeUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrCodeUrl("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ip]);

  function handleConnect() {
    const cleanedIp = ip.trim();

    if (!cleanedIp) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, cleanedIp);
    connect(cleanedIp);
  }

  return (
    <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-bloom-950/30 backdrop-blur-sm">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-bloom-200">Connect</p>
        <h2 className="text-2xl font-semibold text-white">Link your phone to Bloom</h2>
        <p className="text-sm leading-6 text-slate-300">
          Enter the local IP address of the PC running League of Legends and Pengu Loader.
        </p>
      </div>

      <div className="mt-6">
        <StatusBadge state={state} />
      </div>

      <label className="mt-6 block text-sm font-medium text-slate-200" htmlFor="bloom-ip">
        PC IP address
      </label>

      <input
        id="bloom-ip"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="192.168.1.42"
        value={ip}
        onChange={(event) => setIp(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-400/40"
      />

      {qrCodeUrl ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">Scan to open on mobile</p>
          <img
            src={qrCodeUrl}
            alt={`QR code to open Bloom on ${ip.trim()}`}
            width={160}
            height={160}
            className="rounded-2xl border border-white/10 bg-white p-2"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleConnect}
        disabled={state === ConnectionState.Connecting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-bloom-500 px-4 py-3 font-semibold text-white transition hover:bg-bloom-400 disabled:cursor-not-allowed disabled:bg-bloom-500/60"
      >
        {state === ConnectionState.Connecting ? "Connecting..." : "Connect"}
      </button>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Bloom uses a direct LAN WebSocket connection on port 8765. No cloud relay is involved.
      </p>
    </section>
  );
}
