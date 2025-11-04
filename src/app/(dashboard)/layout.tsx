import { DashboardNav } from '@/components/dashboard/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <DashboardNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}

