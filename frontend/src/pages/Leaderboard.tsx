import { Trophy, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Sarah', balance: 1450, change: '+320' },
  { rank: 2, name: 'You', balance: 450, change: '+50' },
  { rank: 3, name: 'Alex', balance: 120, change: '-40' },
  { rank: 4, name: 'John', balance: -450, change: '-450' },
];

export function Leaderboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Trophy className="w-6 h-6 text-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Weekly Leaderboard</h1>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/20 text-xs font-bold uppercase text-muted-foreground">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Trader</div>
          <div className="col-span-5 text-right">Portfolio / Change</div>
        </div>
        
        <div className="divide-y divide-border">
          {MOCK_LEADERBOARD.map((user, idx) => {
            const isWinner = idx === 0;
            const isYou = user.name === 'You';
            
            return (
              <div 
                key={user.name}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/5",
                  isYou && "bg-primary/5"
                )}
              >
                {/* Rank */}
                <div className="col-span-2 text-center font-mono font-bold text-lg">
                  {isWinner ? <span className="text-yellow-500">#1</span> : <span className="text-muted-foreground">#{user.rank}</span>}
                </div>

                {/* Name */}
                <div className="col-span-5 font-semibold text-base flex items-center gap-2">
                  {user.name}
                  {isYou && (
                    <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="col-span-5 text-right">
                  <div className={cn(
                    "font-mono font-bold text-lg",
                    user.balance > 0 ? "text-success" : user.balance < 0 ? "text-destructive" : ""
                  )}>
                    {user.balance > 0 ? '+' : ''}{user.balance}
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 text-xs font-medium mt-0.5">
                    {user.change.startsWith('+') ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : user.change.startsWith('-') ? (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    ) : (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={
                      user.change.startsWith('+') ? "text-success" :
                      user.change.startsWith('-') ? "text-destructive" : "text-muted-foreground"
                    }>
                      {user.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
