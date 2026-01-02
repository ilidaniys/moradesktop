"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";

export function Header() {
  const { user } = useUser();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {/* Page title will be added by individual pages */}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.primaryEmailAddress?.emailAddress || user.fullName || "User"}</span>
          </div>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    </header>
  );
}
