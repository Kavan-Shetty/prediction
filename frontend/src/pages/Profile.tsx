import { useState } from 'react';
import { User, LogOut, Flame, History, Gift, Tv, Users, ShieldAlert, CheckCircle2, Copy, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Profile() {
  const [balance, setBalance] = useState(450);
  const [streak, setStreak] = useState(3);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSuccess, setAdSuccess] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [bailoutClaimed, setBailoutClaimed] = useState(false);

  // 1. Claim Daily Login Bonus
  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    setBalance(prev => prev + 100);
    setStreak(prev => prev + 1);
    setDailyClaimed(true);
    setAdSuccess("🎉 Daily Login Bonus claimed! +$100 Virtual Cash & +1 Day Streak added!");
    setTimeout(() => setAdSuccess(null), 4000);
  };

  // 2. Watch Rewarded Sponsor Video Ad
  const handleWatchAd = () => {
    if (watchingAd) return;
    setWatchingAd(true);
    setAdSuccess(null);
    
    // Simulate 3-second sponsor ad play
    setTimeout(() => {
      setWatchingAd(false);
      setBalance(prev => prev + 250);
      setAdSuccess("📺 Sponsor Video completed (CoinDCX)! +$250 Virtual Cash credited!");
      setTimeout(() => setAdSuccess(null), 4000);
    }, 2500);
  };

  // 3. Copy Referral Link
  const handleCopyReferral = () => {
    navigator.clipboard.writeText("https://predictor.app/refer/KV-8921");
    setCopiedReferral(true);
    setAdSuccess("🤝 Referral link copied! You get +$500 Virtual Cash for every friend who joins!");
    setTimeout(() => {
      setCopiedReferral(false);
      setAdSuccess(null);
    }, 4000);
  };

  // 4. Emergency Bankruptcy Bailout
  const handleClaimBailout = () => {
    if (bailoutClaimed) return;
    setBalance(prev => prev + 200);
    setBailoutClaimed(true);
    setAdSuccess("🆘 Emergency Bailout granted! +$200 Virtual Cash added so you can keep predicting!");
    setTimeout(() => setAdSuccess(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Pro Forecaster • Level 4
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Portfolio & Rewards Hub</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>

      {/* Success / Notification Banner */}
      {adSuccess && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/40 text-success text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{adSuccess}</span>
        </div>
      )}

      {/* Main Balance & Stats Card */}
      <div className="bg-gradient-to-br from-card via-card/90 to-primary/10 border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl border border-primary/40 flex items-center justify-center text-2xl font-bold font-mono text-primary shadow-inner">
              KV
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Kavan (You)</h2>
              <p className="text-xs text-muted-foreground font-medium">Syndicate Leader • 14 Predictions Placed</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                  Verified Account
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[10px] font-mono font-bold uppercase border border-purple-500/30">
                  Top 5% Analyst
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center min-w-[130px]">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Available Cash</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-success">${balance}.00</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Zero INR Risk</div>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center min-w-[130px]">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Daily Streak
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-orange-500">{streak} Days</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">2x Reward Multiplier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Virtual Cash Refill / Daily Reward Engine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Free Virtual Cash Refill Engine
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Run out of virtual cash? Refill your balance instantly without spending real money! These mechanics keep syndicates active 24/7.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            100% Free-to-Play
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Daily Login Bonus */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-mono font-extrabold text-success text-sm">+100 Cash</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-base">Daily Login Streak Reward</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log in every 24 hours to claim your daily stipend. Maintain a 7-day streak for a +1,000 Cash Mega Refill!
              </p>
            </div>
            <Button 
              onClick={handleClaimDaily} 
              disabled={dailyClaimed}
              className={`w-full font-bold text-xs h-10 ${dailyClaimed ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
            >
              {dailyClaimed ? '✓ Claimed Today (Come back tomorrow)' : 'Claim Daily +$100 Cash'}
            </Button>
          </div>

          {/* 2. Watch Rewarded Sponsor Video Ad */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <span className="font-mono font-extrabold text-success text-sm">+250 Cash</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-base">Watch Sponsor Video Ad</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Watch a 15-second sponsor trailer (e.g. CoinDCX, Netflix). You get instant virtual cash; Predictor makes ₹2 ad revenue!
              </p>
            </div>
            <Button 
              onClick={handleWatchAd} 
              disabled={watchingAd}
              className="w-full font-bold text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {watchingAd ? '📺 Playing Sponsor Video (3s)...' : '▶ Watch Video for +$250 Cash'}
            </Button>
          </div>

          {/* 3. Viral Referral Invite Link */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-mono font-extrabold text-success text-sm">+500 Cash / Friend</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-base">Refer Friends to Syndicate</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share your unique invite link. For every friend who signs up and joins a private group, both of you get +$500 Cash!
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleCopyReferral} 
              className="w-full font-bold text-xs h-10 border-purple-500/40 text-purple-500 hover:bg-purple-500/10 flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedReferral ? 'Copied Link!' : 'Copy Invite Link (https://predictor.app/refer/KV-8921)'}
            </Button>
          </div>

          {/* 4. Emergency Bankruptcy Bailout */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-mono font-extrabold text-success text-sm">+200 Cash</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-base">Emergency Bankruptcy Bailout</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                On a bad prediction losing streak? Once every 24 hours, claim a free emergency bailout so you are never permanently out!
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleClaimBailout}
              disabled={bailoutClaimed}
              className={`w-full font-bold text-xs h-10 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 ${bailoutClaimed ? 'opacity-50' : ''}`}
            >
              {bailoutClaimed ? '✓ Bailout Claimed Today' : '🆘 Claim Emergency Bailout (+$200)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Syndicate Activity */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <History className="w-5 h-5 text-primary" />
          Your Prediction Activity
        </h3>
        
        <div className="bg-card border border-border rounded-2xl divide-y divide-border/60 shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center hover:bg-muted/10 transition-colors">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-foreground">US 2028 Presidential Election Winner</div>
              <div className="text-xs text-muted-foreground font-mono">Global Public Exchange • Outcome: Gavin Newsom (Yes)</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-foreground text-sm">100 Shares ($32.00)</div>
              <div className="text-xs text-amber-500 font-bold flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> Active Order</div>
            </div>
          </div>
          
          <div className="p-4 flex justify-between items-center hover:bg-muted/10 transition-colors">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-foreground">Will John show up to the meeting on time tomorrow?</div>
              <div className="text-xs text-muted-foreground font-mono">🔒 The Boys (Private) • Outcome: Yes</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-success text-sm">+150 Cash Won</div>
              <div className="text-xs text-success font-bold">Resolved • Consensus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
