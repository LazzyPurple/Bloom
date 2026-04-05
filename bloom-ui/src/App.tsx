import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import StatusBadge from "./components/StatusBadge";
import { ConnectionState, useBloomWS } from "./hooks/useBloomWS";
import Connect from "./pages/Connect";
import Home from "./pages/Home";

export default function App() {
  const bloom = useBloomWS();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-md items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bloom-200">Bloom</p>
              <h1 className="text-lg font-semibold">League client remote</h1>
            </div>
            <StatusBadge state={bloom.state} />
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-md items-center px-5 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/connect" replace />} />
            <Route
              path="/connect"
              element={<Connect connect={bloom.connect} state={bloom.state} />}
            />
            <Route
              path="/home"
              element={
                bloom.state === ConnectionState.Connected ? (
                  <Home
                    disconnect={bloom.disconnect}
                    lastEvent={bloom.lastEvent}
                    send={bloom.send}
                    state={bloom.state}
                  />
                ) : (
                  <Navigate to="/connect" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
