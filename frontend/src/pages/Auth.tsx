import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Flame, Loader2, Sparkles } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;
      
      if (result.data.user) {
        navigate('/explore');
      }
    } catch (err: any) {
      // Automatic fallback for Vercel demos without live backend/database keys
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || import.meta.env.VITE_SUPABASE_URL.includes('dummy')) {
        console.warn("Using mock auth due to placeholder Supabase keys");
        setTimeout(() => navigate('/explore'), 600);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        setLoading(false);
      }
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/explore');
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-2xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight leading-none text-foreground">
              Predictor
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Global • Private
            </span>
          </div>
        </div>

        {/* One-Click Demo Login Button for Vercel Visitors */}
        <div className="mb-6 pb-6 border-b border-border/60">
          <Button 
            type="button" 
            onClick={handleDemoLogin}
            className="w-full h-11 font-extrabold bg-gradient-to-r from-primary to-amber-500 hover:opacity-95 text-primary-foreground shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            ⚡ Instant Demo Login
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2 font-medium">
            No signup required. Test the hybrid exchange instantly.
          </p>
        </div>

        <h1 className="text-base font-bold mb-1 text-foreground">
          {isSignUp ? 'Create a regular account' : 'Log in with Email'}
        </h1>
        <p className="text-xs text-muted-foreground mb-4 font-medium">
          {isSignUp ? 'Enter your details below.' : 'Or use your registered account.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-3.5">
          {error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 text-xs font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          
          <Button 
            type="submit" 
            variant="outline"
            className="w-full h-10 text-xs font-bold mt-2 border-border hover:bg-muted/40"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isSignUp ? 'Sign Up with Email' : 'Log In with Email'
            )}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-primary hover:underline font-bold"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
