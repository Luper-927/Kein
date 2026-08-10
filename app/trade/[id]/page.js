"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function TradeDetail() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id;

  const [myBusinessId, setMyBusinessId] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

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
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    setMyBusinessId(biz?.id);

    const { data: tx } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", tradeId)
      .single();
    setTransaction(tx);

    const { data: esc } = await supabase
      .from("escrow_holds")
      .select("*")
      .eq("transaction_id", tradeId)
      .single();
    setEscrow(esc);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeId]);

  async function handleUpdate(newStatus) {
    setActionLoading(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("update_escrow", {
      escrow_id: escrow.id,
      new_status: newStatus,
    });
    if (rpcError) {
      setError(rpcError.message);
      setActionLoading(false);
      return;
    }
    await load();
    setActionLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-night flex items-center justify-center text-mist font-mono text-sm">
        Loading…
      </main>
    );
  }

  if (!transaction || !escrow) {
    return (
      <main className="min-h-screen bg-night flex items-center justify-center text-mist font-mono text-sm">
        Trade not found.
      </main>
    );
  }

  const isSender = myBusinessId === transaction.sender_business_id;
  const isReceiver = myBusinessId === transaction.receiver_business_id;

  return (
    <main className="min-h-screen bg-night px-6 py-8 md:px-16 md:py-12">
      <div className="max-w-md mx-auto">
        <div className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-2">
          TradePay
        </div>
        <h1 className="font-display text-3xl text-paper mb-1">
          {Number(transaction.amount).toLocaleString()} {transaction.currency}
        </h1>
        <p className="text-mist text-sm mb-8 font-mono">
          {isSender ? "You are paying" : "You are receiving"} · {isSender ? "Sender" : isReceiver ? "Receiver" : "Viewer"}
        </p>

        <div className="border border-line rounded-lg bg-dusk p-6 mb-6">
          <div className="flex items-center justify-between mb-4 font-mono text-xs">
            {["locked", "shipped", "delivered", "released"].map((step, i) => {
              const reached =
                (step === "locked" && escrow.status !== "refunded") ||
                (step === "shipped" && escrow.proof_of_shipment_url) ||
                (step === "delivered" && escrow.proof_of_delivery_url) ||
                (step === "released" && escrow.status === "released");
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        reached ? "bg-gold" : "border border-line"
                      }`}
                    ></span>
                    <span
                      className={reached ? "text-gold" : "text-mist"}
                    >
                      {step.toUpperCase()}
                    </span>
                  </div>
                  {i < 3 && <div className="flex-1 h-px bg-line -mt-4"></div>}
                </div>
              );
            })}
          </div>
          <p className="text-mist text-xs font-mono">
            Release condition: {escrow.release_condition.replace(/_/g, " ")}
          </p>
          {escrow.status === "disputed" && (
            <p className="text-red-400 text-xs font-mono mt-2">
              This trade is under dispute.
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 font-mono mb-4">{error}</p>
        )}

        {escrow.status === "locked" && (
          <div className="flex flex-col gap-3">
            {isSender && !escrow.proof_of_delivery_url && (
              <button
                onClick={() => handleUpdate("locked")}
                disabled={actionLoading}
                className="border border-line hover:border-gold text-paper rounded-md px-4 py-2.5 font-mono text-sm disabled:opacity-50"
              >
                Mark shipment sent
              </button>
            )}
            {isReceiver && (
              <button
                onClick={() => handleUpdate("released")}
                disabled={actionLoading}
                className="bg-gold hover:bg-goldbright transition-colors text-night font-semibold rounded-md px-4 py-2.5 disabled:opacity-50"
              >
                Confirm delivery & release funds
              </button>
            )}
            {isSender && (
              <p className="text-mist text-xs font-mono text-center">
                Waiting for receiver to confirm delivery and release funds.
              </p>
            )}
          </div>
        )}

        {escrow.status === "released" && (
          <div className="border border-gold rounded-lg p-5 text-center">
            <p className="text-gold font-mono text-sm">
              Funds released — trade complete.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="text-mist text-sm font-mono mt-6"
        >
          ← Back to dashboard
        </button>
      </div>
    </main>
  );
}
