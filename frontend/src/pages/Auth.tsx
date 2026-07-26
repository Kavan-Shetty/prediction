import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Flame, Loader2 } from 'lucide-react';

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
        navigate('/groups');
      }
    } catch (err: any) {
      if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        console.warn("Using mock auth due to dummy Supabase keys");
        setTimeout(() => navigate('/groups'), 800);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      if (!import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Flame className="w-6 h-6 text-primary" />
          <span className="text-2xl font-bold tracking-tight">Predictor</span>
        </div>

        <h1 className="text-xl font-semibold mb-2">
          {isSignUp ? 'Create an account' : 'Log in to your account'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isSignUp ? 'Enter your details to get started.' : 'Welcome back.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-10 text-sm font-bold mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isSignUp ? 'Sign Up' : 'Log In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline font-semibold"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
