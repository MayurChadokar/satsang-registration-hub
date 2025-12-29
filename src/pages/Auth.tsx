import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message || 'Invalid credentials. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome Back!',
            description: 'You have successfully logged in.',
          });
        }
      } else {
        const { error } = await signUp(data.email, data.password);
        if (error) {
          toast({
            title: 'Signup Failed',
            description: error.message || 'Could not create account. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Please contact admin to get admin access.',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary shadow-glow mb-4">
            <span className="text-3xl font-bold text-primary-foreground">ॐ</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Radhasoami Satsang Beas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bujurag Sangat Registration Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl bg-card p-8 shadow-card border border-border/50">
          <h2 className="mb-6 text-center text-xl font-serif font-semibold text-foreground">
            {isLogin ? 'Admin Login' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-12"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-12 pr-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Protected portal for authorized administrators only
        </p>
      </div>
    </div>
  );
}
