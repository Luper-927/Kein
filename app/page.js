"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      const userId = data.user?.id;
      if (userId) {
        await supabase.from("businesses").insert({
          auth_user_id: userId,
          business_name: businessName,
          country,
        });
      }
      router.push("/dashboard");
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <section className="md:w-1/2 flex flex-col justify-between px-8 py-12 md:px-16 md:py-20 bg-night border-b md:border-b-0 md:border-r border-line">
        <div>
          <div className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-8">
            TradePay
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-paper mb-6">
            Funds don't move
            <br />
            until <span className="text-gold">both sides trust</span> the deal.
          </h1>
          <p className="text-mist text-base leading-relaxed max-w-md">
            Escrow-backed settlement for African B2B trade. A buyer in Lagos
            and a supplier in Accra transact in stablecoin, held until
            delivery is confirmed — no letter of credit, no wire delays.
          </p>
        </div>

        <div className="mt-16 hidden md:block">
          <div className="flex items-center gap-3 font-mono text-xs text-mist">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold"></span>
              FUNDED
            </div>
            <div className="flex-1 h-px bg-line"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-mist"></span>
              LOCKED
            </div>
            <div className="flex-1 h-px bg-line"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-mist"></span>
              RELEASED
            </div>
          </div>
        </div>
      </section>

      <section className="md:w-1/2 flex items-center justify-center px-8 py-12 md:px-16 bg-dusk">
        <div className="w-full max-w-sm">
          <div className="flex gap-6 mb-8 font-mono text-sm">
            <button
              onClick={() => setMode("signup")}
              className={mode === "signup" ? "text-gold" : "text-mist"}
            >
              Create account
            </button>
            <button
              onClick={() => setMode("login")}
              className={mode === "login" ? "text-gold" : "text-mist"}
            >
              Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                    Business name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-night border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
                    placeholder="Adaeze Textiles Ltd"
                  />
                </div>
                <div>
                  <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-night border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
                  >
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>Kenya</option>
                    <option>South Africa</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-night border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
                placeholder="you@business.com"
              />
            </div>
            <div>
              <label className="block text-xs text-mist mb-1.5 font-mono uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-night border border-line rounded-md px-4 py-2.5 text-paper focus:outline-none focus:border-gold"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gold hover:bg-goldbright transition-colors text-night font-semibold rounded-md px-4 py-2.5 disabled:opacity-50"
            >
              {loading
                ? "Please wait…"
                : mode === "signup"
                ? "Create account"
                : "Log in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
