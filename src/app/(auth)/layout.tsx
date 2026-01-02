import { Separator } from "~/components/ui/separator";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Focus Planner
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your areas, intentions, and chunks
          </p>
          <Separator className="mt-4" />
        </div>
        {children}
      </div>
    </div>
  );
}
