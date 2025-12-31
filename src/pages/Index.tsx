import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { RegistrationForm } from '@/components/RegistrationForm';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
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
      <div className="mx-auto max-w-2xl">
        {/* Title Section */}
        <div className="mb-8 text-center animate-slide-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            New Registration
          </h2>
          <p className="text-muted-foreground">
            Register elderly sangat members for the satsang
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-card border border-border/50 animate-fade-in">
          <RegistrationForm />
        </div>
      </div>
    </AdminLayout>
  );
}
