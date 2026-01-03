import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/hooks/useAuth';

export default function Registrations() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mx-auto max-w-md text-center animate-fade-in p-8">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Access Restricted
          </h2>
          <p className="text-muted-foreground">
            You don't have admin privileges. Please contact the administrator to
            get access to this portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        {/* Title Section */}
        <div className="mb-8 text-center animate-slide-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            All Registrations
          </h2>
          <p className="text-muted-foreground">
            View and manage all registered sangat members
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-card border border-border/50 animate-fade-in">
          <div className="text-center py-12">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Registration Management
            </h3>
            <p className="text-muted-foreground mb-6">
              Registration list and management features will be implemented here.
            </p>
            <div className="text-sm text-muted-foreground">
              This page will display all registered members with options to view, edit, and manage registrations.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}