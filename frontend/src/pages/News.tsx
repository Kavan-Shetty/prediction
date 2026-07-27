import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Flame, Sparkles, TrendingUp, Globe, Clock, ArrowUpRight, Zap, CheckCircle2, Bot, ShieldCheck, Filter, Search, Send, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  location: string;
  timeAgo: string;
  category: string;
  region: string;
  marketId: string;
  marketTitle: string;
  yesPrice: number;
  noPrice: number;
  priceChange24h: string;
  isPositive: boolean;
  ammLiquidity: string;
  resolvesAt: string;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    headline: 'RBI Governor hints at inflation cooling below 4% target by Q4 2026',
    summary: 'During the Mumbai banking summit today, policy makers indicated repo rate cuts could begin sooner if monsoon rainfall exceeds 102% of the Long Period Average (LPA).',
    source: 'Economic Times',
    location: 'Mumbai, India 🇮🇳',
    timeAgo: '12m ago',
    category: 'Economy & RBI',
    region: 'India & South Asia',
    marketId: 'rbi-repo-cut-2026',
    marketTitle: 'Will RBI cut the Repo Rate below 6.0% before Dec 31, 2026?',
    yesPrice: 0.42,
    noPrice: 0.58,
    priceChange24h: '+8.5%',
    isPositive: true,
    ammLiquidity: '$15,000 Virtual Cash',
    resolvesAt: 'Dec 31, 2026 • Official RBI Press Release'
  },
  {
    id: 'news-2',
    headline: 'OpenAI registers "GPT-5 Orion" trademark across US and EU IP offices',
    summary: 'Leaked regulatory filings show OpenAI has begun certifying new multimodal voice and autonomous coding agent frameworks ahead of an anticipated developer conference.',
    source: 'TechCrunch',
    location: 'Silicon Valley, USA 🇺🇸',
    timeAgo: '28m ago',
    category: 'AI & Tech',
    region: 'USA & Americas',
    marketId: 'gpt5-release-2026',
    marketTitle: 'Will OpenAI officially release GPT-5 before November 30, 2026?',
    yesPrice: 0.68,
    noPrice: 0.32,
    priceChange24h: '+14.2%',
    isPositive: true,
    ammLiquidity: '$45,000 Virtual Cash',
    resolvesAt: 'Nov 30, 2026 • Official OpenAI Blog'
  },
  {
    id: 'news-3',
    headline: 'BCCI confirms mega auction retention rules for IPL 2027 season',
    summary: 'Franchises will be permitted to retain up to 6 core players, sparking intense trade speculation regarding Mumbai Indians and CSK leadership lineups.',
    source: 'ESPN Cricinfo',
    location: 'New Delhi, India 🇮🇳',
    timeAgo: '45m ago',
    category: 'Sports',
    region: 'India & South Asia',
    marketId: 'ipl-2027-winner',
    marketTitle: 'Will Mumbai Indians win the IPL 2027 Trophy?',
    yesPrice: 0.26,
    noPrice: 0.74,
    priceChange24h: '-3.1%',
    isPositive: false,
    ammLiquidity: '$30,000 Virtual Cash',
    resolvesAt: 'May 31, 2027 • Official BCCI Match Result'
  },
  {
    id: 'news-4',
    headline: 'European Commission opens antitrust inquiry into AI cloud bundling',
    summary: 'Brussels regulators examine whether hyperscalers are restricting competition by bundling proprietary AI inference chips with enterprise cloud storage contracts.',
    source: 'Reuters',
    location: 'Brussels, Belgium 🇪🇺',
    timeAgo: '1h ago',
    category: 'Politics & Law',
    region: 'Europe & UK',
    marketId: 'eu-ai-antitrust-fine',
    marketTitle: 'Will the EU issue a >$500M antitrust fine against a US tech giant in 2026?',
    yesPrice: 0.54,
    noPrice: 0.46,
    priceChange24h: '+6.0%',
    isPositive: true,
    ammLiquidity: '$20,000 Virtual Cash',
    resolvesAt: 'Dec 31, 2026 • European Commission Press Room'
  },
  {
    id: 'news-5',
    headline: 'Rockstar Games drops second trailer teaser for Grand Theft Auto VI',
    summary: 'The 15-second social media clip broke YouTube view records within 4 hours, confirming Vice City map expansion and dynamic weather simulation.',
    source: 'IGN News',
    location: 'London, UK 🇬🇧',
    timeAgo: '2h ago',
    category: 'Entertainment',
    region: 'Global',
    marketId: 'gta6-1b-opening-weekend',
    marketTitle: 'Will GTA 6 generate over $1.5 Billion in global sales within 72 hours of launch?',
    yesPrice: 0.82,
    noPrice: 0.18,
    priceChange24h: '+5.4%',
    isPositive: true,
    ammLiquidity: '$50,000 Virtual Cash',
    resolvesAt: 'Dec 31, 2026 • Take-Two Interactive SEC 8-K Filing'
  },
  {
    id: 'news-6',
    headline: 'Bitcoin crosses key $94,000 resistance as spot ETF inflows surge in Asia',
    summary: 'Hong Kong and Tokyo institutional trading desks recorded record daily net purchases of Bitcoin spot products as macroeconomic easing expectations broaden.',
    source: 'Bloomberg Crypto',
    location: 'Tokyo, Japan 🇯🇵',
    timeAgo: '3h ago',
    category: 'Crypto & DeFi',
    region: 'Asia-Pacific',
    marketId: 'btc-120k-december',
    marketTitle: 'Will Bitcoin (BTC) touch $120,000 on major spot exchanges before Dec 31?',
    yesPrice: 0.48,
    noPrice: 0.52,
    priceChange24h: '+11.8%',
    isPositive: true,
    ammLiquidity: '$60,000 Virtual Cash',
    resolvesAt: 'Dec 31, 2026 • Binance / Coinbase Spot Index'
  }
];

const CATEGORIES = ['All News', 'Economy & RBI', 'AI & Tech', 'Sports', 'Politics & Law', 'Crypto & DeFi', 'Entertainment'];
const REGIONS = ['All Nations', 'India & South Asia', 'USA & Americas', 'Europe & UK', 'Asia-Pacific', 'Global'];

export function News() {
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('All News');
  const [selectedRegion, setSelectedRegion] = useState('All Nations');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive AI Market Generator state
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [headlineInput, setHeadlineInput] = useState('');
  const [sourceInput, setSourceInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Trade Modal state
  const [activeTradeItem, setActiveTradeItem] = useState<NewsItem | null>(null);
  const [tradeSide, setTradeSide] = useState<'YES' | 'NO'>('YES');
  const [tradeShares, setTradeShares] = useState(250);

  // Filter logic
  const filteredNews = newsList.filter((item) => {
    const matchesCat = selectedCategory === 'All News' || item.category === selectedCategory;
    const matchesReg = selectedRegion === 'All Nations' || item.region === selectedRegion;
    const matchesSearch = searchQuery === '' || 
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.marketTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesReg && matchesSearch;
  });

  // Handle simulated AI Oracle Market auto-creation
  const handleAutoGenerateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headlineInput.trim()) return;

    setIsGenerating(true);
    setSuccessMsg(null);

    setTimeout(() => {
      const newId = `custom-ai-${Date.now()}`;
      const autoMarketTitle = headlineInput.includes('?') 
        ? headlineInput 
        : `Will the events in "${headlineInput.slice(0, 45)}..." happen as reported before end of year?`;
      
      const newItem: NewsItem = {
        id: newId,
        headline: headlineInput,
        summary: `AI Oracle automatically verified this report via Reuters/Bloomberg RSS feeds and initialized a binary conditional token contract on the CLOB engine.`,
        source: sourceInput || 'Global Live RSS Feed',
        location: 'Verified AI Oracle 🌐',
        timeAgo: 'Just now',
        category: 'AI & Tech',
        region: 'Global',
        marketId: newId,
        marketTitle: autoMarketTitle,
        yesPrice: 0.50,
        noPrice: 0.50,
        priceChange24h: 'NEW 🚀',
        isPositive: true,
        ammLiquidity: '$25,000 Virtual Cash (AMM Bot)',
        resolvesAt: 'Dec 31, 2026 • Official Primary Source Verification'
      };

      setNewsList([newItem, ...newsList]);
      setIsGenerating(false);
      setIsAiGeneratorOpen(false);
      setHeadlineInput('');
      setSourceInput('');
      setSuccessMsg(`🤖 AI ORACLE SUCCESS! Created new live prediction market with $25,000 AMM liquidity seeded!`);
      setTimeout(() => setSuccessMsg(null), 6000);
    }, 1800);
  };

  // Handle quick trade execution
  const handleExecuteQuickTrade = () => {
    if (!activeTradeItem) return;
    const cost = Math.round(tradeShares * (tradeSide === 'YES' ? activeTradeItem.yesPrice : activeTradeItem.noPrice));
    setActiveTradeItem(null);
    setSuccessMsg(`⚡ ORDER FILLED! You bought ${tradeShares} ${tradeSide} shares on "${activeTradeItem.marketTitle}" for $${cost} Virtual Cash!`);
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header & AI Oracle Status Banner */}
      <div className="bg-gradient-to-br from-card via-card/90 to-primary/10 border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-mono font-extrabold uppercase tracking-wider animate-pulse">
              <Bot className="w-3.5 h-3.5" /> 50-NATION AI NEWS ORACLE ACTIVE • REAL-TIME FEED
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Newspaper className="w-8 h-8 text-primary shrink-0" />
              Real-Time News & Auto-Opened Markets
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl">
              Just like Polymarket and Kalshi, whenever breaking world news hits across our 50 target nations, our AI Oracle automatically creates a binary prediction market and seeds it with virtual cash liquidity!
            </p>
          </div>

          <Button 
            onClick={() => setIsAiGeneratorOpen(true)}
            className="w-full md:w-auto h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            Submit News to Auto-Open Market
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/40 text-success text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search news or markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs font-medium"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Region Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 px-2 shrink-0">
          <Globe className="w-3.5 h-3.5 text-primary" /> Filter Nation:
        </span>
        {REGIONS.map((reg) => (
          <button
            key={reg}
            onClick={() => setSelectedRegion(reg)}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap border transition-all ${
              selectedRegion === reg
                ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-2xs'
                : 'bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* News & Attached Market Cards */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-foreground">No Breaking News found for this filter</h3>
            <p className="text-xs text-muted-foreground">Try selecting a different category or nation, or click "Submit News" to auto-open a market!</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div 
              key={item.id}
              className="bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md flex flex-col lg:flex-row justify-between gap-6 relative group overflow-hidden"
            >
              {/* Left Column: News Story */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold text-primary flex items-center gap-1">
                    📰 {item.source}
                  </span>
                  <span className="text-muted-foreground font-mono">•</span>
                  <span className="text-muted-foreground font-semibold">{item.location}</span>
                  <span className="text-muted-foreground font-mono">•</span>
                  <span className="text-muted-foreground font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timeAgo}
                  </span>
                  <span className="ml-auto px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono text-[10px] font-bold uppercase border border-border/50">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.headline}
                </h3>
                
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                  {item.summary}
                </p>

                <div className="pt-1 flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Primary Source
                  </span>
                  <span>•</span>
                  <span>Oracle Trigger: {item.resolvesAt}</span>
                </div>
              </div>

              {/* Right Column: The Auto-Opened Prediction Market Box */}
              <div className="w-full lg:w-96 shrink-0 bg-muted/20 border border-border/60 rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-bl-lg border-b border-l border-primary/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI ORACLE MARKET
                </div>

                <div>
                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                    Attached Prediction Contract
                  </div>
                  <Link to={`/bets/${item.marketId}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {item.marketTitle}
                  </Link>
                </div>

                {/* Odds & Price Ladder */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button 
                    onClick={() => { setActiveTradeItem(item); setTradeSide('YES'); }}
                    className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 transition-all text-left group/btn"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-500">YES</span>
                      <span className="text-xs font-mono font-black text-foreground">{(item.yesPrice * 100).toFixed(0)}¢</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5 flex justify-between">
                      <span>Buy Share</span>
                      <span className="text-emerald-500 font-bold">{item.priceChange24h}</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTradeItem(item); setTradeSide('NO'); }}
                    className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 transition-all text-left group/btn"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-rose-500">NO</span>
                      <span className="text-xs font-mono font-black text-foreground">{(item.noPrice * 100).toFixed(0)}¢</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5 flex justify-between">
                      <span>Buy Share</span>
                      <span>Inverse</span>
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                  <span className="text-primary font-bold">💧 {item.ammLiquidity}</span>
                  <Link to={`/bets/${item.marketId}`} className="text-foreground hover:text-primary font-bold flex items-center gap-0.5">
                    Order Book <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Submit News to Auto-Open Market */}
      <Dialog
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        title="🤖 Submit News to Auto-Open Market"
        description="Paste a breaking world news URL or headline. Our AI Oracle will verify the report, structure the binary YES/NO rules, and seed $25,000 in Virtual Cash liquidity via the AMM bot!"
      >
        <form onSubmit={handleAutoGenerateMarket} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Breaking News Headline / Question</label>
            <Input
              placeholder="e.g. RBI announces emergency repo rate meeting for August 2026..."
              value={headlineInput}
              onChange={(e) => setHeadlineInput(e.target.value)}
              required
              className="h-11 font-semibold text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Source / URL (Optional)</label>
            <Input
              placeholder="e.g. https://www.rbi.org.in or Reuters / Economic Times"
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
              className="h-11 font-medium text-xs font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 font-medium flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
            <span>
              <strong>How it works:</strong> The Golang CLOB engine will initialize the contract in Level-2 memory and deploy an internal Automated Market Maker (AMM) bot to provide instant bid-ask spreads!
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsAiGeneratorOpen(false)} className="h-10 px-5 font-semibold text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={!headlineInput.trim() || isGenerating} className="h-10 px-6 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs shadow-md flex items-center gap-2">
              {isGenerating ? '🤖 AI Verifying Report (2s)...' : '⚡ Auto-Open Prediction Market'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 2: Instant Quick Trade on Breaking News */}
      <Dialog
        isOpen={!!activeTradeItem}
        onClose={() => setActiveTradeItem(null)}
        title={`⚡ Quick Trade: ${tradeSide} on Breaking News`}
        description={activeTradeItem?.marketTitle}
      >
        {activeTradeItem && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Selected Outcome</div>
                <div className={`text-lg font-black ${tradeSide === 'YES' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {tradeSide} ({(tradeSide === 'YES' ? activeTradeItem.yesPrice : activeTradeItem.noPrice) * 100}¢ per share)
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Your Cash Balance</div>
                <div className="text-sm font-black text-success">$450.00</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>Number of Shares to Buy</span>
                <span className="font-mono text-foreground font-black">{tradeShares} Shares</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={tradeShares}
                onChange={(e) => setTradeShares(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>10 Shares</span>
                <span>500 Shares</span>
                <span>1,000 Shares</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Share Price:</span>
                <span>${tradeSide === 'YES' ? activeTradeItem.yesPrice : activeTradeItem.noPrice} Virtual Cash</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Execution Cost:</span>
                <span className="text-foreground font-bold">${Math.round(tradeShares * (tradeSide === 'YES' ? activeTradeItem.yesPrice : activeTradeItem.noPrice))} Cash</span>
              </div>
              <div className="flex justify-between text-success font-bold pt-1 border-t border-border/50">
                <span>Potential Payout (If {tradeSide} wins):</span>
                <span>${tradeShares}.00 Virtual Cash</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => setActiveTradeItem(null)} className="h-10 px-5 font-semibold text-xs">
                Cancel
              </Button>
              <Button 
                onClick={handleExecuteQuickTrade} 
                className={`h-10 px-6 font-bold text-white text-xs shadow-md ${tradeSide === 'YES' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                ⚡ Execute {tradeSide} Order (${Math.round(tradeShares * (tradeSide === 'YES' ? activeTradeItem.yesPrice : activeTradeItem.noPrice))})
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
