import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-lg px-4">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
          <footer className="border-t border-border/50 bg-card/50">
            <div className="px-4 py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Radhasoami Satsang Beas • Bujurag Sangat Portal
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
