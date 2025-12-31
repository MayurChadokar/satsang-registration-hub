import { LogOut, User, Users, Plus } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary shadow-soft">
            <span className="text-lg font-bold text-primary-foreground">ॐ</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
              Radhasoami Satsang Beas
            </h1>
            <p className="text-xs text-muted-foreground">Bujurag Sangat Registration</p>
          </div>
        </div>

        {user && isAdmin && (
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Registration
              </Button>
            </Link>
            <Link to="/registrations">
              <Button
                variant={location.pathname === '/registrations' ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Users className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </nav>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{user.email}</span>
              {isAdmin && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Admin
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
