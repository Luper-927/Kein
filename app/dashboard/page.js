"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      setBusiness(biz);

      if (biz) {
        const { data: w } = await supabase
          .from("wallets")
          .select("*")
          .eq("business_id", biz.id);
        setWallets(w || []);

        const { data: tx } = await supabase
          .from("transactions")
          .select("*")
          .or(
            `sender_business_id.eq.${biz.id},receiver_business_id.eq.${biz.id}`
          )
          .order("created_at", { ascending: false })
          .limit(10);
        setTransactions(tx || []);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-night flex items-center justify-center text-mist font-mono text-sm">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-night px-6 py-8 md:px-16 md:py-12">
      <header className="flex items-center justify-between mb-12">
        <div>
          <div className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-1">
            TradePay
          </div>
          <h1 className="font-display text-2xl text-paper">
            {business?.business_name || "Your business"}
          </h1>
          <p className="text-mist text-sm font-mono mt-1">
            {business?.country} · KYC:{" "}
            <span
              className={
                business?.kyc_status === "verified"
                  ? "text-gold"
                  : "text-mist"
              }
            >
              {business?.kyc_status || "pending"}
            </span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-mist hover:text-paper font-mono text-sm border border-line rounded-md px-4 py-2"
        >
          Log out
        </button>
      </header>

      <section className="mb-12">
        <h2 className="font-mono text-xs text-mist uppercase tracking-wide mb-4">
          Balances
        </h2>
        {wallets.length === 0 ? (
          <div className="border border-line rounded-lg p-8 text-center bg-dusk">
            <p className="text-mist text-sm">
              No wallets yet. Balances appear here once you fund your account
              through a supported currency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="border border-line rounded-lg p-5 bg-dusk"
              >
                <div className="text-mist font-mono text-xs uppercase mb-2">
                  {w.currency}
                </div>
                <div className="text-paper font-display text-2xl">
                  {Number(w.balance).toLocaleString()}
                </div>
                {w.balance !== w.available_balance && (
                  <div className="text-gold font-mono text-xs mt-1">
                    {(w.balance - w.available_balance).toLocaleString()} in
                    escrow
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-mono text-xs text-mist uppercase tracking-wide mb-4">
          Recent activity
        </h2>
        {transactions.length === 0 ? (
          <div className="border border-line rounded-lg p-8 text-center bg-dusk">
            <p className="text-mist text-sm">
              Nothing here yet. Your first trade settlement will show up in
              this list.
            </p>
          </div>
        ) : (
          <div className="border border-line rounded-lg divide-y divide-line bg-dusk overflow-hidden">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <div className="text-paper text-sm">
                    {tx.transaction_type.replace("_", " ")}
                  </div>
                  <div className="text-mist font-mono text-xs mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-paper font-mono text-sm">
                    {Number(tx.amount).toLocaleString()} {tx.currency}
                  </div>
                  <div
                    className={`font-mono text-xs mt-0.5 uppercase ${
                      tx.status === "released"
                        ? "text-gold"
                        : tx.status === "failed"
                        ? "text-red-400"
                        : "text-mist"
                    }`}
                  >
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
