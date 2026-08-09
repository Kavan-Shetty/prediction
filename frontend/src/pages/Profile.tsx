import { useState, useEffect } from 'react';
import { User, LogOut, Flame, History, Gift, Tv, Users, ShieldAlert, CheckCircle2, Copy, Sparkles, TrendingUp, ShieldCheck, Zap, Crown, Award, Send, Check, Edit2, LayoutDashboard, Wallet, Settings, Shield, PieChart, Activity, Fingerprint, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';

// 5-Tier Fair Play Subscription Ladder ($0 to $100)
const VIP_TIERS = [
  {
    id: 'free',
    name: '🟢 Free-to-Play',
    price: '$0 / mo',
    tagline: '100% Competitive Equality',
    color: 'text-emerald-500',
    border: 'border-border/60',
    bg: 'bg-card',
    features: [
      'Same starting bankroll & odds as all tiers',
      'Access all 13 Categories & 50 Nations',
      'Claim Daily +$100 Virtual Cash Refill',
      'Join up to 3 Private Friend Groups'
    ]
  },
  {
    id: 'pro',
    name: '🔵 Pro Analyst',
    price: '$9.99 / mo',
    tagline: 'Personal Journal & OLED Themes',
    color: 'text-blue-500',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    popular: false,
    features: [
      'Personal Trading Win-Rate Journal',
      'Custom UI Themes (OLED Black / Cyberpunk)',
      '⭐️ Pro Forecaster profile badge',
      'Zero competitive trading advantage'
    ]
  },
  {
    id: 'syndicate',
    name: '🟣 Syndicate Host',
    price: '$29.99 / mo',
    tagline: 'For Community & Club Leaders',
    color: 'text-purple-500',
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    popular: true,
    features: [
      'Host Private Groups up to 250 Members',
      'Vanity invite link (predictor.io/join/club)',
      'Export group rankings to Excel / CSV',
      'Custom group banners and logos'
    ]
  },
  {
    id: 'league',
    name: '🟠 League Master',
    price: '$49.99 / mo',
    tagline: 'Automated Discord & Slack Bot',
    color: 'text-amber-500',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    popular: false,
    features: [
      'Host Syndicates up to 1,500 Members',
      '🤖 Automated Discord & Slack Webhook Bot',
      '🏆 Multi-Round Seasonal Tournaments',
      'Custom group chat emojis and titles'
    ]
  },
  {
    id: 'enterprise',
    name: '🟡 Enterprise Host',
    price: '$99.99 / mo',
    tagline: 'The $100 Large Organization Tier',
    color: 'text-yellow-500',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    popular: false,
    features: [
      'Host Tournaments with 5,000+ Members',
      'White-Label Embed Widget for websites/blogs',
      'Design custom profile badges for members',
      '💎 Diamond Founding Host Profile Badge'
    ]
  }
];

export function Profile() {
  const [balance, setBalance] = useState(450);
  const [streak, setStreak] = useState(3);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSuccess, setAdSuccess] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [bailoutClaimed, setBailoutClaimed] = useState(false);

  // VIP & Gifting State
  const [activeVipTier, setActiveVipTier] = useState('free');
  const [isGiftingOpen, setIsGiftingOpen] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftTier, setGiftTier] = useState('league');
  const [giftMessage, setGiftMessage] = useState('Congratulations on winning our prediction league! Enjoy your subscription prize!');

  // Profile Identity State
  const [username, setUsername] = useState('user_123');
  const [displayName, setDisplayName] = useState('Kavan (You)');
  const [bio, setBio] = useState('Syndicate Leader');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'settings' | 'security'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', displayName: '', bio: '', avatarUrl: '', bannerUrl: '', isPublic: true });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch user profile from backend
    fetch('http://localhost:8000/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.username) setUsername(data.username);
        if (data.display_name) setDisplayName(data.display_name);
        if (data.bio) setBio(data.bio);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        if (data.banner_url) setBannerUrl(data.banner_url);
        if (data.balance) setBalance(data.balance);
        if (data.streak) setStreak(data.streak);
        if (data.vip_tier) setActiveVipTier(data.vip_tier);
        if (data.level) setLevel(data.level);
        if (data.xp) setXp(data.xp);
        if (data.is_public !== undefined) setIsPublic(data.is_public);
        if (data.two_factor_enabled !== undefined) setTwoFactorEnabled(data.two_factor_enabled);
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  const handleOpenEditProfile = () => {
    setEditForm({ username, displayName, bio, avatarUrl, bannerUrl, isPublic });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editForm.username,
          display_name: editForm.displayName,
          bio: editForm.bio,
          avatar_url: editForm.avatarUrl,
          banner_url: editForm.bannerUrl,
          is_public: editForm.isPublic
        })
      });
      if (res.ok) {
        setUsername(editForm.username);
        setDisplayName(editForm.displayName);
        setBio(editForm.bio);
        setAvatarUrl(editForm.avatarUrl);
        setBannerUrl(editForm.bannerUrl);
        setIsPublic(editForm.isPublic);
        setIsEditingProfile(false);
        setAdSuccess("✅ Profile successfully updated!");
        setTimeout(() => setAdSuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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

  // 5. Upgrade VIP Subscription
  const handleUpgradeVip = (tierId: string, tierName: string) => {
    setActiveVipTier(tierId);
    setAdSuccess(`💎 CONGRATULATIONS! You are now subscribed to "${tierName}"! Zero pay-to-win enforced; all community organizer tools unlocked!`);
    setTimeout(() => setAdSuccess(null), 6000);
  };

  // 6. Send Gift Subscription
  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRecipient.trim()) return;
    
    const selectedTierMeta = VIP_TIERS.find(t => t.id === giftTier) || VIP_TIERS[3];
    setIsGiftingOpen(false);
    setAdSuccess(`🎁 GIFT SENT! You successfully gifted a "${selectedTierMeta.name}" (${selectedTierMeta.price}) subscription to @${giftRecipient}! They have been notified!`);
    setGiftRecipient('');
    setTimeout(() => setAdSuccess(null), 7000);
  };

  const currentVipMeta = VIP_TIERS.find(t => t.id === activeVipTier) || VIP_TIERS[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-24">
      {/* Dynamic Profile Banner */}
      <div className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden border border-border/50 shadow-xl group">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Profile Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 flex items-center justify-center">
            <span className="text-muted-foreground/50 font-bold tracking-widest uppercase text-sm">No Banner Set</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md text-primary text-xs font-mono font-bold uppercase tracking-wider mb-2 border border-primary/30">
              <Sparkles className="w-3.5 h-3.5" /> Level {level} • {xp} XP
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {displayName}
            </h1>
            <p className="text-muted-foreground font-medium mt-1">@{username}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-muted/20 border border-border/40 rounded-2xl">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'wallet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
          <Wallet className="w-4 h-4" /> Wallet & History
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button onClick={() => setActiveTab('security')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
          <Shield className="w-4 h-4" /> Security
        </button>
        <button onClick={() => setActiveTab('limits')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'limits' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}>
          <ShieldAlert className="w-4 h-4" /> Limits
        </button>
      </div>

      <div className="flex gap-2 justify-end mb-4">
        <Button 
          onClick={() => setIsGiftingOpen(true)} 
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md"
        >
          <Gift className="w-4 h-4" />
          Gift VIP
        </Button>
      </div>

      {/* Success / Notification Banner */}
      {adSuccess && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/40 text-success text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{adSuccess}</span>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Advanced Analytics & Portfolio Engine */}
          <div className="bg-gradient-to-br from-card via-card/90 to-primary/10 border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Left: User Identity */}
          <div className="flex flex-col gap-5 xl:w-1/3">
            <div className="flex items-center gap-5">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 bg-primary/10 rounded-3xl border border-primary/40 object-cover shadow-inner" />
              ) : (
                <div className="w-24 h-24 bg-primary/20 rounded-3xl border border-primary/40 flex items-center justify-center text-3xl font-black font-mono text-primary shadow-inner">
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              
              <div>
                <h2 className="text-3xl font-black text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">{bio} • <span className="text-primary font-bold">{currentVipMeta.name}</span></p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Fair Play
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={handleOpenEditProfile} variant="outline" size="sm" className="w-full gap-2 text-xs font-bold border-border/60 hover:bg-muted/50">
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>

          {/* Right: Deep Analytics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 xl:w-2/3">
            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Available Cash</div>
              <div className="text-2xl font-mono font-black text-success">${balance}.00</div>
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Net Profit</div>
              <div className="text-2xl font-mono font-black text-emerald-500">+$3,200</div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Global Rank</div>
              <div className="text-2xl font-mono font-black text-foreground">#182</div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Accuracy</div>
              <div className="text-2xl font-mono font-black text-primary">74%</div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Best Category</div>
              <div className="text-sm font-black text-cyan-500 uppercase mt-1">AI & Tech</div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/60 text-center flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-colors">
              <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors" />
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Win Streak
              </div>
              <div className="text-2xl font-mono font-black text-orange-500">{streak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: 5-Tier Fair Play VIP Subscription Ladder ($0 to $100) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-500 uppercase tracking-wider mb-1">
              <Crown className="w-4 h-4" /> 100% Fair Play • Zero Pay-To-Win Enforced
            </div>
            <h3 className="text-2xl font-black text-foreground">
              VIP Tiers & Organizer Superpowers ($0 to $100/mo)
            </h3>
            <p className="text-xs text-muted-foreground font-medium max-w-2xl">
              Paying never gives trading or cash advantages. Upgrading gives you administrative superpowers to host massive prediction leagues, automated Discord/Slack bots, and seasonal tournaments!
            </p>
          </div>
          <Button onClick={() => setIsGiftingOpen(true)} variant="outline" className="text-xs font-bold border-purple-500/40 text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> Gift Tier to Tournament Winner
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {VIP_TIERS.map((tier) => {
            const isCurrent = activeVipTier === tier.id;
            return (
              <div 
                key={tier.id}
                className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden ${tier.border} ${tier.bg} ${
                  isCurrent ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:border-foreground/40'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-indigo-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                    Popular
                  </div>
                )}
                
                <div>
                  <div className={`text-sm font-black mb-0.5 ${tier.color}`}>{tier.name}</div>
                  <div className="text-xl font-mono font-black text-foreground mb-1">{tier.price}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold mb-4 pb-3 border-b border-border/40">{tier.tagline}</div>
                  
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="text-xs text-foreground/90 flex items-start gap-2 font-medium leading-tight">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tier.color}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleUpgradeVip(tier.id, tier.name)}
                  disabled={isCurrent}
                  className={`w-full text-xs font-bold h-9 ${
                    isCurrent 
                      ? 'bg-success text-success-foreground cursor-default' 
                      : tier.id === 'league' || tier.id === 'enterprise' || tier.id === 'syndicate'
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                        : 'bg-muted/60 hover:bg-muted text-foreground'
                  }`}
                >
                  {isCurrent ? '✓ Current Active Plan' : `Upgrade to ${tier.name.split(' ')[1] || tier.name}`}
                </Button>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WALLET & HISTORY */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
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
            100% Free-to-Play Refills
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

          {/* 4. Daily Streak Ad Boost */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-orange-500/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-mono font-extrabold text-success text-sm">2x Booster</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-foreground text-base">Double Daily Streak Reward</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Watch a quick 5-second ad to instantly double your daily login reward tomorrow! Maximize your Virtual Cash.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleClaimBailout}
              disabled={bailoutClaimed}
              className={`w-full font-bold text-xs h-10 border-orange-500/40 text-orange-500 hover:bg-orange-500/10 ${bailoutClaimed ? 'opacity-50' : ''}`}
            >
              {bailoutClaimed ? '✓ 2x Boost Activated' : '⚡ Activate 2x Reward Boost'}
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
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Profile Settings</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Username (Unique Handle)</label>
                  <Input value={editForm.username} onChange={e => setEditForm(prev => ({...prev, username: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Display Name</label>
                  <Input value={editForm.displayName} onChange={e => setEditForm(prev => ({...prev, displayName: e.target.value}))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Bio / Status</label>
                <textarea value={editForm.bio} onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))} rows={3} className="w-full p-3 rounded-xl bg-background border border-border text-xs font-medium focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Avatar URL</label>
                <Input value={editForm.avatarUrl} onChange={e => setEditForm(prev => ({...prev, avatarUrl: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Banner Background URL</label>
                <Input value={editForm.bannerUrl} onChange={e => setEditForm(prev => ({...prev, bannerUrl: e.target.value}))} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isPublic" checked={editForm.isPublic} onChange={e => setEditForm(prev => ({...prev, isPublic: e.target.checked}))} className="rounded border-border bg-background" />
                <label htmlFor="isPublic" className="text-sm font-semibold">Make Profile Public (Show stats & portfolio)</label>
              </div>
              <Button type="submit" disabled={isSaving} className="mt-4">{isSaving ? "Saving..." : "Save Settings"}</Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Security & Devices</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFactorEnabled ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{twoFactorEnabled ? 'Your account is highly secure.' : 'Not enabled. We highly recommend enabling 2FA.'}</p>
                  </div>
                </div>
                <Button variant={twoFactorEnabled ? "outline" : "default"} size="sm">{twoFactorEnabled ? "Manage" : "Enable 2FA"}</Button>
              </div>

              <div className="border rounded-2xl overflow-hidden">
                <div className="p-4 bg-muted/20 border-b border-border/50 flex justify-between items-center">
                  <h4 className="font-bold text-sm">Active Sessions</h4>
                  <Button variant="outline" size="sm" className="text-[10px] h-7 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">Log Out All Devices</Button>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="p-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-bold">iPhone 14 Pro (Current)</div>
                        <div className="text-[10px] text-muted-foreground">San Francisco, CA • IP: 192.168.1.1</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LIMITS */}
      {activeTab === 'limits' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-500" /> Responsible Gaming & Limits</h3>
            <p className="text-sm text-muted-foreground mb-6">Manage your play time and virtual spending to keep predicting fun and healthy.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/10">
                <div>
                  <h4 className="font-bold text-sm">Self-Imposed Wager Limits</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Cap the maximum amount of virtual coins you can bet per day.</p>
                </div>
                <Button variant="outline" size="sm">Set Limits</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/10">
                <div>
                  <h4 className="font-bold text-sm">Cooling-Off Period</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Freeze profile access and halt all gameplay for 24 hours to 30 days.</p>
                </div>
                <Button variant="outline" size="sm" className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10">Take a Break</Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10">Permanently Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gifting Dialog */}
      <Dialog isOpen={isGiftingOpen} onClose={() => setIsGiftingOpen(false)} title="Gift VIP Subscription">
        description="The ultimate legal tournament prize! Reward tournament winners or syndicate friends with organizer superpowers."
      >
        <form onSubmit={handleSendGift} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipient Username / Friend Tag</label>
            <Input 
              placeholder="e.g. @Alex_Trader, @Sarah_Crypto, or Tournament_Winner" 
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              required
              className="h-11 font-semibold text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select VIP Tier to Gift</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIP_TIERS.filter(t => t.id !== 'free').map(tier => {
                const isSel = giftTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setGiftTier(tier.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSel 
                        ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold shadow-2xs scale-[1.02]' 
                        : 'bg-muted/10 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <div className="text-xs font-black text-foreground">{tier.name}</div>
                    <div className="font-mono text-xs font-bold text-primary mt-0.5">{tier.price}</div>
                    <div className="text-[10px] text-muted-foreground truncate mt-1">{tier.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Celebratory Gift Message</label>
            <textarea 
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs font-medium focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsGiftingOpen(false)} className="h-10 px-5 font-semibold text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={!giftRecipient.trim()} className="h-10 px-6 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs shadow-md flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              Send Gift Subscription
            </Button>
          </div>
        </form>
      </Dialog>


    </div>
  );
}
