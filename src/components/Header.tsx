import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();

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
