"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";
import { ThemeToggle } from "~/components/theme/ThemeToggle";

export function Header() {
  const { user } = useUser();

  return (
    <header className="flex h-16 items-center justify-between bg-background px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-foreground">
          {/* Page title will be added by individual pages */}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2.5 text-sm text-secondary">
            <User className="h-4 w-4" />
            <span className="font-normal">{user.primaryEmailAddress?.emailAddress || user.fullName || "User"}</span>
          </div>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 rounded-full",
            },
          }}
        />
      </div>
    </header>
  );
}
