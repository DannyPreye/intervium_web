import AppShell from "@/components/app/AppShell";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <ConfirmProvider>{children}</ConfirmProvider>
    </AppShell>
  );
}
