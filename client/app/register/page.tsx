"use client";

import { FormEvent, useState } from "react";
import { useRegisterMutation } from "../store/authApi";
import { useRouter } from "next/navigation";
import { ArrowRight, Layers3 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await register({
        name,
        email,
        password,
      }).unwrap();

      console.log("Registration successful:", response.data);

      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
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
            <h2>Give good ideas somewhere to go.</h2>
            <p>
              Build a workspace that feels as focused as the work you want to do
              in it.
            </p>
            <div className="auth-art-quote">
              Small steps. Visible progress. Better momentum.
            </div>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="auth-kicker">A fresh start</p>
          <h1 className="auth-title">Make room for momentum.</h1>
          <p className="auth-subtitle">
            Create your workspace and turn the next idea into a real project.
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-label">
              Your name
              <input
                type="text"
                placeholder="How should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-control"
                required
              />
            </label>
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
                placeholder="At least 8 characters"
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
                "Creating workspace..."
              ) : (
                <>
                  Create workspace <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}
