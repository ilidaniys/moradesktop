import { MainLayout } from "~/components/layout/MainLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk middleware handles auth protection automatically
  return <MainLayout>{children}</MainLayout>;
}
