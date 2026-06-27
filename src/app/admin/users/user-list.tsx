"use client";

import { useState, useTransition } from "react";
import { generateInviteCode } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/form";
import { CheckIcon, CopyIcon } from "@/components/icons";

type User = {
  id: number;
  name: string;
  inviteCode: string;
  isAdmin: boolean;
  unlockedPredictionCount: number;
};

export function UserList({
  users,
  unlockedMatchCount,
}: {
  users: User[];
  unlockedMatchCount: number;
}) {
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function handleGenerate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await generateInviteCode(newName.trim());
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        setNewName("");
      }
    });
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
        <Input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Uuden pelaajan nimi"
          className="flex-1"
        />
        <Button
          onClick={handleGenerate}
          disabled={isPending || !newName.trim()}
        >
          {isPending ? "Luodaan..." : "Luo"}
        </Button>
      </div>

      {generatedCode && (
        <div className="mb-4 rounded-lg border border-success-200 bg-success-50 p-3">
          <p className="mb-2 text-sm font-medium text-success-800">
            Uusi kutsukoodi luotu
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 font-mono text-sm">
              {generatedCode}
            </code>
            <Button
              variant="success"
              size="sm"
              onClick={() => copyToClipboard(generatedCode)}
            >
              <CopyIcon className="h-3.5 w-3.5" />
              {copied === generatedCode ? "Kopioitu" : "Kopioi"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => {
          const complete =
            unlockedMatchCount === 0 ||
            user.unlockedPredictionCount >= unlockedMatchCount;

          return (
            <Card key={user.id} className="flex items-center justify-between p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900">
                    {user.name}
                  </span>
                  {user.isAdmin && (
                    <Badge variant="primary" size="sm">ADMIN</Badge>
                  )}
                  {complete ? (
                    <CheckIcon className="h-4 w-4 text-success-600" />
                  ) : (
                    <span className="text-xs tabular-nums text-warning-700">
                      {user.unlockedPredictionCount}/{unlockedMatchCount}
                    </span>
                  )}
                </div>
                <div className="truncate font-mono text-xs text-zinc-500">
                  {user.inviteCode}
                </div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(user.inviteCode)}
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  {copied === user.inviteCode ? "Kopioitu" : "Kopioi"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
