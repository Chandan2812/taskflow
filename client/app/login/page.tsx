"use client";

import { FormEvent, useState } from "react";
import { useLoginMutation } from "../store/authApi";
import { useAuth } from "../store/useAuth";
import { useRouter } from "next/navigation";
import { saveAuth } from "../store/authStorage";

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
    } catch (error: any) {
      console.error("Login failed:", error);
      console.log("Login error details:", JSON.stringify(error, null, 2));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-3xl font-bold mb-6">Login to TaskFlow</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black text-white py-3 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="font-medium text-black underline">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
