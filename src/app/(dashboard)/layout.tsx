import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <Topbar />

          {/* Page content */}
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </ToastProvider>
  );
}
