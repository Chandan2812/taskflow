"use client";

import { FormEvent, useState } from "react";
import { useLoginMutation } from "../store/authApi";
import { useAuth } from "../store/useAuth";
import { useRouter } from "next/navigation";
import { saveAuth } from "../store/authStorage";
import { ArrowRight, Layers3 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();
  const { saveCredentials } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      saveCredentials(response.data.user, response.data.token);

      saveAuth(response.data.token, response.data.user);

      router.push("/");

      console.log("Login successful:", response.data.user);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      console.log("Login error details:", JSON.stringify(error, null, 2));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-art">
        <div className="auth-art-content">
          <div className="auth-brand">
            <Layers3 size={22} /> TaskFlow
          </div>
          <div className="auth-art-copy">
            <h2>Turn busy into beautifully clear.</h2>
            <p>
              A quiet home for ambitious work. Organize the moving parts, then
              give your attention to what matters next.
            </p>
            <div className="auth-art-quote">
              “Clarity is a competitive advantage.”
            </div>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="auth-kicker">Welcome back</p>
          <h1 className="auth-title">Good to see you.</h1>
          <p className="auth-subtitle">
            Sign in to pick up exactly where you left off.
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-label">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-control"
                required
              />
            </label>
            <label className="field-label">
              Password
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-control"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Enter workspace <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="auth-link">
            New to TaskFlow? <a href="/register">Create an account</a>
          </p>
        </div>
      </section>
    </main>
  );
}
