import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/components/auth';

export default function AppPage() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}