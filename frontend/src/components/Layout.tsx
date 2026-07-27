import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Trophy, Users, User, Flame, Globe, Lock, Sparkles, Gift } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Public Exchange', path: '/explore', icon: Globe, badge: '50 NATIONS' },
    { name: 'Private Groups', path: '/groups', icon: Lock, badge: 'SYNDICATES' },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'VIP & Gifts', path: '/profile', icon: Gift, badge: 'NEW' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 px-4 sm:px-8 h-16 border-b border-border bg-background/95 backdrop-blur flex justify-between items-center transition-all shadow-2xs">
        <Link to="/explore" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight leading-none text-foreground group-hover:text-primary transition-colors">
              Predictor
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Global • Private
            </span>
          </div>
        </Link>
        
        <nav className="hidden md:flex gap-2 h-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            const isVip = item.name.includes('VIP');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : isVip 
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isVip && !isActive && "text-purple-400 animate-pulse")} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold",
                    isActive ? "bg-black/20 text-primary-foreground" : isVip ? "bg-purple-500/20 text-purple-300" : "bg-muted text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/profile" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/30 text-xs font-extrabold text-purple-300 hover:border-purple-500/60 transition-all shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>VIP Tiers ($0-$100)</span>
          </Link>
          
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cash Balance</span>
            <span className="text-sm font-mono font-extrabold text-success">$450.00</span>
          </div>
          <Link to="/profile">
            <div className="w-9 h-9 rounded-full bg-muted/40 border border-border/80 flex items-center justify-center font-bold text-xs hover:border-primary transition-colors cursor-pointer shadow-sm">
              KV
            </div>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur pb-safe">
        <div className="flex justify-around p-2">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentPath.startsWith(item.path);
             const isVip = item.name.includes('VIP');
             return (
               <Link
                 key={item.name}
                 to={item.path}
                 className={cn(
                   "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors flex-1 text-center",
                   isActive ? "text-primary font-bold" : isVip ? "text-purple-400 font-bold" : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 <Icon className="w-5 h-5" />
                 <span className="text-[10px] font-bold leading-tight">{item.name}</span>
               </Link>
             )
          })}
        </div>
      </nav>
    </div>
  );
}
