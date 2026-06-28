"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export function LoginForm({
  sessionExpired = false,
}: {
  sessionExpired?: boolean;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);

    const result = await login(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/predictions");
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Futistietäjä
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Jalkapallon MM-kisojen veikkauspeli
          </p>
        </div>
      </div>

      {sessionExpired && (
        <p className="rounded-md bg-zinc-100 px-3 py-2 text-center text-sm text-zinc-600">
          Kirjautumisesi on vanhentunut. Kirjaudu sisään uudelleen.
        </p>
      )}

      <div>
        <label
          htmlFor="inviteCode"
          className="block text-sm font-medium text-zinc-700"
        >
          Kutsukoodi
        </label>
        <Input
          type="text"
          id="inviteCode"
          name="inviteCode"
          required
          autoFocus
          placeholder="Syötä kutsukoodi"
          className="mt-1.5"
        />
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
      </Button>
    </form>
  );
}
