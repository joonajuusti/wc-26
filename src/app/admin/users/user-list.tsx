"use client";

import { useState } from "react";
import { generateInviteCode } from "@/actions/admin";

type User = {
  id: number;
  name: string;
  inviteCode: string;
  isAdmin: boolean;
  sessionToken: string | null;
};

export function UserList({ users }: { users: User[] }) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    if (!newName.trim()) return;
    setLoading(true);
    const result = await generateInviteCode(newName.trim());
    setLoading(false);
    if (result.success && result.code) {
      setGeneratedCode(result.code);
      setNewName("");
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Uuden pelaajan nimi"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Luo
        </button>
      </div>

      {generatedCode && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
            Uusi kutsukoodi luotu
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-2 py-1 font-mono text-sm dark:bg-zinc-800">
              {generatedCode}
            </code>
            <button
              onClick={() => copyToClipboard(generatedCode)}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              {copied === generatedCode ? "Kopioitu" : "Kopioi"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {user.name}
                {user.isAdmin && (
                  <span className="ml-2 text-xs text-blue-600">ADMIN</span>
                )}
              </div>
              <div className="font-mono text-xs text-zinc-500 truncate">
                {user.inviteCode}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-xs text-zinc-500">
                {user.sessionToken ? "Aktiivinen" : "Ei kirjautunut"}
              </span>
              <button
                onClick={() => copyToClipboard(user.inviteCode)}
                className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {copied === user.inviteCode ? "Kopioitu" : "Kopioi"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
