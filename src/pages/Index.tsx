import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center animate-fade-in">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Radhasoami Satsang Beas • Bujurag Sangat Portal
        </div>
      </footer>
    </div>
  );
}
