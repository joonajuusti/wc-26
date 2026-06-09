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

  async function handleGenerate() {
    if (!newName.trim()) return;
    setLoading(true);
    await generateInviteCode(newName.trim());
    setNewName("");
    setLoading(false);
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

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {user.name}
                {user.isAdmin && (
                  <span className="ml-2 text-xs text-blue-600">ADMIN</span>
                )}
              </div>
              <div className="font-mono text-xs text-zinc-500">
                {user.inviteCode}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {user.sessionToken ? "Aktiivinen" : "Ei kirjautunut"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
