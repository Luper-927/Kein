"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function NewTrade() {
  const router = useRouter();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [condition, setCondition] = useState("delivery_confirmed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("create_trade", {
      receiver_email: receiverEmail,
      trade_amount: parseFloat(amount),
      trade_currency: currency,
      release_condition_text: condition,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.push(`/trade/${data}`);
  }

  return (
    <main className="min-h-screen bg-night px-6 py-8 md:px-16 md:py-12">
      <div className="max-w-md mx-auto">
        <div className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-2">
          TradePay
        </div>
        <h1 className="font-display text-3xl text-paper mb-2">New trade</h1>
        <p className="text-mist text-sm mb-8">
          Funds are locked until your release condition is met. Nothing
          transfers until you release it.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
              Counterparty email
            </label>
            <input
              type="email"
              required
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              className="w-full bg-dusk border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
              placeholder="supplier@business.com"
            />
            <p className="text-mist text-xs mt-1.5">
              They must already have a TradePay account with this email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                Amount
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-dusk border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-dusk border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
              >
                <option>USDC</option>
                <option>USDT</option>
                <option>NGN</option>
                <option>GHS</option>
                <option>KES</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
              Release condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-dusk border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
            >
              <option value="delivery_confirmed">
                On delivery confirmation
              </option>
              <option value="shipment_proof">On proof of shipment</option>
              <option value="mutual_release">Mutual release (both agree)</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gold hover:bg-goldbright transition-colors text-night font-semibold rounded-md px-4 py-2.5 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Lock funds in escrow"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-mist text-sm font-mono"
          >
            ← Back to dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
