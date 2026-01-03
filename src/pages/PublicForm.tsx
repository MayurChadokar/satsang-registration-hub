import { RegistrationForm } from '@/components/RegistrationForm';

export default function PublicForm() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary shadow-soft">
              <span className="text-lg font-bold text-primary-foreground">RSSB</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
                Radhasoami Satsang Beas
              </h1>
              <p className="text-xs text-muted-foreground">Bujurag Sangat Registration</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Title Section */}
          <div className="mb-8 text-center animate-slide-up">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              Registration Form
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
