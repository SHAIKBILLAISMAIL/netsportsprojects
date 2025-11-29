"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GameLauncher } from "./game-launcher";

export const AdminDashboard = () => {
  // Tabs
  const tabs = [
    "Overview",
    "Games",
    "Users",
    "Bets",
    "Wallet",
    "Promotions",
    "Content",
    "Settings",
  ] as const;
  type Tab = (typeof tabs)[number];
  const [active, setActive] = useState<Tab>("Overview");

  // Launcher (Games)
  const [gameUrl, setGameUrl] = useState("");
  const [launchUrl, setLaunchUrl] = useState<string | undefined>();
  const [gameTitle, setGameTitle] = useState("Custom Game");

  // Users (mock)
  type User = { id: number; name: string; email: string; status: "active" | "banned" };
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active" },
    { id: 3, name: "Alpha Tester", email: "alpha@nicebet.test", status: "banned" },
  ]);
  const [userQuery, setUserQuery] = useState("");
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(userQuery.toLowerCase())
      ),
    [users, userQuery]
  );

  const toggleUserStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u))
    );
  };

  // Bets (mock monitor)
  type Bet = { id: string; user: string; market: string; stake: number; potential: number; status: "open" | "won" | "lost" };
  const [bets, setBets] = useState<Bet[]>([]);
  const seedBets = () => {
    const markets = ["Football", "Basketball", "Tennis", "Aviator", "Spaceman"];
    const statuses: Bet["status"][] = ["open", "won", "lost"];
    const next: Bet[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${Date.now()}-${i}`,
      user: ["John", "Jane", "Alex", "Mila"][Math.floor(Math.random() * 4)],
      market: markets[Math.floor(Math.random() * markets.length)],
      stake: Number((Math.random() * 50 + 1).toFixed(2)),
      potential: Number((Math.random() * 300 + 50).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
    setBets(next);
  };
  useEffect(() => {
    seedBets();
  }, []);

  // Wallet (mock)
  const [wallet, setWallet] = useState<number>(1000);
  const amountRef = useRef<HTMLInputElement>(null);
  const credit = () => {
    const v = Number(amountRef.current?.value || 0);
    if (!isFinite(v) || v <= 0) return;
    setWallet((x) => Number((x + v).toFixed(2)));
    amountRef.current!.value = "";
  };
  const debit = () => {
    const v = Number(amountRef.current?.value || 0);
    if (!isFinite(v) || v <= 0) return;
    setWallet((x) => Number(Math.max(0, x - v).toFixed(2)));
    amountRef.current!.value = "";
  };

  // Promotions (mock)
  type Promo = { id: string; title: string; code: string; active: boolean };
  const [promos, setPromos] = useState<Promo[]>([
    { id: "P-1", title: "Welcome Bonus 100%", code: "WELCOME100", active: true },
  ]);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const addPromo = () => {
    if (!promoTitle || !promoCode) return;
    setPromos((p) => [{ id: `P-${Date.now()}`, title: promoTitle, code: promoCode.toUpperCase(), active: true }, ...p]);
    setPromoTitle("");
    setPromoCode("");
  };
  const togglePromo = (id: string) => setPromos((p) => p.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));

  // Settings
  const [maintenance, setMaintenance] = useState<boolean>(false);
  useEffect(() => {
    const stored = localStorage.getItem("nb_maintenance") === "1";
    setMaintenance(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("nb_maintenance", maintenance ? "1" : "0");
    window.dispatchEvent(new CustomEvent("maintenance-mode-changed", { detail: { on: maintenance } }));
  }, [maintenance]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`rounded-md border px-3 py-1 text-sm transition-colors ${
              active === t ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panels */}
      {active === "Overview" && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdminStat title="Active Users" value="1,248" />
          <AdminStat title="Open Bets" value={String(bets.filter((b) => b.status === "open").length)} />
          <AdminStat title="Wallet Float" value={`$${wallet.toFixed(2)}`} />

          <div className="col-span-full rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              <QuickLink href="/en/sports" label="Sports" />
              <QuickLink href="/en/sports?page=live" label="Live Sports" />
              <QuickLink href="/en/games/casino" label="Casino" />
              <QuickLink href="/en/games/casino-live" label="Live Casino" />
              <QuickLink href="/en/games/crash-games" label="Crash Games" />
              <QuickLink href="/en/virtuals" label="Virtuals" />
              <QuickLink href="/en/lottery" label="Lottery" />
              <QuickLink href="/en/promotions" label="Promotions" />
              <QuickLink href="/en/wallet" label="Wallet" />
              <QuickLink href="/en/bets" label="Bets" />
              <QuickLink href="/en/account" label="Accounts" />
              <QuickLink href="/" label="Homepage" />
            </div>
          </div>
        </section>
      )}

      {active === "Games" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Game Launcher Tester</h3>
            <p className="mb-3 text-sm text-muted-foreground">Paste a launch URL from your backend to test embedding.</p>
            <div className="mb-3 grid gap-2">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://provider.example.com/launch?token=..."
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
              />
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Game Title (optional)"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setLaunchUrl(gameUrl || undefined)}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Launch
                </button>
                <button
                  onClick={() => setLaunchUrl(undefined)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="rounded-md border bg-background p-2">
              {launchUrl ? (
                <GameLauncher title={gameTitle || "Game"} gameUrl={launchUrl} />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Enter a game URL and click Launch to preview here
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Featured Game Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <QuickLink href="/en/games/crash-games/play/33194/real" label="Aviator (real)" />
              <QuickLink href="/en/games/crash-games/play/22461/real" label="Spaceman (real)" />
              <QuickLink href="/en/games/casino" label="Casino Lobby" />
              <QuickLink href="/en/games/casino-live" label="Live Casino Lobby" />
              <QuickLink href="/en/games/crash-games" label="Crash Games" />
              <QuickLink href="/en/esports" label="E-Sports" />
            </div>
          </div>
        </section>
      )}

      {active === "Users" && (
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Users</h3>
            <input
              className="w-60 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search users..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b/50">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          u.status === "active"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                      >
                        {u.status === "active" ? "Ban" : "Unban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {active === "Bets" && (
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Bets</h3>
            <button onClick={seedBets} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
              Refresh
            </button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Bet ID</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Market</th>
                  <th className="p-2">Stake</th>
                  <th className="p-2">Potential</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((b) => (
                  <tr key={b.id} className="border-b/50">
                    <td className="p-2">{b.id}</td>
                    <td className="p-2">{b.user}</td>
                    <td className="p-2">{b.market}</td>
                    <td className="p-2">${b.stake.toFixed(2)}</td>
                    <td className="p-2">${b.potential.toFixed(2)}</td>
                    <td className="p-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          b.status === "open"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : b.status === "won"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {active === "Wallet" && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Float Control (Demo)</h3>
            <p className="mb-3 text-sm text-muted-foreground">Simulate credit/debit to test wallet UI flows.</p>
            <div className="mb-2 text-2xl font-bold">${wallet.toFixed(2)}</div>
            <div className="flex gap-2">
              <input
                ref={amountRef}
                type="number"
                min={0}
                step={0.01}
                placeholder="Amount"
                className="w-40 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={credit} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                Credit
              </button>
              <button onClick={debit} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
                Debit
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Wallet Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <QuickLink href="/en/wallet" label="Wallet Page" />
              <QuickLink href="/en/bets" label="Bets Page" />
              <QuickLink href="/en/account" label="Accounts" />
            </div>
          </div>
        </section>
      )}

      {active === "Promotions" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Create Promotion</h3>
            <div className="mb-3 grid gap-2">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Title"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
              />
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={addPromo} className="w-fit rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                Add Promotion
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Promotions</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Title</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Active</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id} className="border-b/50">
                      <td className="p-2">{p.title}</td>
                      <td className="p-2">{p.code}</td>
                      <td className="p-2">{p.active ? "Yes" : "No"}</td>
                      <td className="p-2">
                        <button onClick={() => togglePromo(p.id)} className="rounded-md border px-2 py-1 text-xs hover:bg-accent">
                          {p.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {active === "Content" && (
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-lg font-semibold">Site Content Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <QuickLink href="/en/promotions" label="Promotions" />
            <QuickLink href="/en/live" label="Live" />
            <QuickLink href="/en/virtuals" label="Virtuals" />
            <QuickLink href="/en/lottery" label="Lottery" />
            <QuickLink href="/en/esports" label="E-Sports" />
            <QuickLink href="/" label="Homepage" />
          </div>
        </section>
      )}

      {active === "Settings" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Maintenance Mode</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Toggle a site-wide local setting (stored in browser) for testing banners or behavior.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm">Status:</span>
              <span className={`rounded px-2 py-0.5 text-xs ${maintenance ? "bg-yellow-600/20 text-yellow-400" : "bg-green-600/20 text-green-400"}`}>
                {maintenance ? "ON" : "OFF"}
              </span>
              <button onClick={() => setMaintenance((x) => !x)} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
                Toggle
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Developer Tools</h3>
            <div className="flex flex-wrap gap-2">
              <QuickLink href="/api/auth" label="Auth API" />
              <QuickLink href="/api" label="API Root" />
              <QuickLink href="/en/bets" label="Bets UI" />
              <QuickLink href="/en/wallet" label="Wallet UI" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const AdminStat = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const QuickLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-md border bg-background px-3 py-2 text-center text-sm hover:bg-accent"
  >
    {label}
  </Link>
);