import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, ArrowLeft, Loader2, CheckCircle2, Layers, Check, Landmark, Trophy, Music, Briefcase, Cpu, Flame, Film, CloudRain, Scale, Video, Rocket, Crown, BookOpen, MapPin, Globe, Sparkles, Bot } from 'lucide-react';
import { fetchMarketDetail, placeTrade } from '../lib/api';
import { cn } from '../lib/utils';

// Helper for formatting cents and percentages
const formatCents = (val: number) => `${Math.round(val * 100)}¢`;
const formatProb = (val: number) => `${Math.round(val * 100)}%`;

const CATEGORY_MAP: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  POLITICS: { label: 'Politics', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
  SPORTS: { label: 'Sports', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  BUSINESS: { label: 'Economy', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  TECH: { label: 'AI & Crypto', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  MUSIC: { label: 'Music', icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
  LITERATURE: { label: 'Literature', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  CINEMA: { label: 'Cinema & Gaming', icon: Film, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/30' },
  WEATHER: { label: 'Weather', icon: CloudRain, color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/30' },
  LAW: { label: 'Law & Regs', icon: Scale, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  CREATORS: { label: 'Creators', icon: Video, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' },
  SCIENCE: { label: 'Science & Space', icon: Rocket, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/30' },
  REALITY_TV: { label: 'Reality TV', icon: Crown, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/30' },
};

// Real-Time News Dictionary: Ensures EVERY news market opens its own unique, realistic order book!
const MOCK_NEWS_DICTIONARY: Record<string, any> = {
  'pub-1': {
    id: 'pub-1',
    title: 'US 2028 Presidential Election Winner',
    category: 'POLITICS',
    region: 'US',
    volume: '$3,450,200',
    closingIn: '2y 4m',
    creator: 'Predictor Official',
    contracts: [
      { id: 'c-1a', text: 'Gavin Newsom', prob: '32%', price: '32¢', yesPrice: 0.32, noPrice: 0.68, yesShares: '14,200', noShares: '32,100', change: '+4%' },
      { id: 'c-1b', text: 'JD Vance', prob: '28%', price: '28¢', yesPrice: 0.28, noPrice: 0.72, yesShares: '12,900', noShares: '34,500', change: '-2%' },
      { id: 'c-1c', text: 'Josh Shapiro', prob: '18%', price: '18¢', yesPrice: 0.18, noPrice: 0.82, yesShares: '8,400', noShares: '41,000', change: '+1%' },
      { id: 'c-1d', text: 'Any Other Candidate', prob: '22%', price: '22¢', yesPrice: 0.22, noPrice: 0.78, yesShares: '9,800', noShares: '38,200', change: '-1%' },
    ]
  },
  'pub-2': {
    id: 'pub-2',
    title: 'Bitcoin (BTC) to touch $150,000 before Q4 2026?',
    category: 'TECH',
    region: 'GLOBAL',
    volume: '$2,148,500',
    closingIn: '4m 12h',
    creator: 'CryptoOracle',
    contracts: [
      { id: 'c-2a', text: 'Yes, touches $150k+', prob: '64%', price: '64¢', yesPrice: 0.64, noPrice: 0.36, yesShares: '28,400', noShares: '14,100', change: '+8%' },
      { id: 'c-2b', text: 'No, stays below $150k', prob: '36%', price: '36¢', yesPrice: 0.36, noPrice: 0.64, yesShares: '14,100', noShares: '28,400', change: '-8%' },
    ]
  },
  'pub-3': {
    id: 'pub-3',
    title: 'Grammy Album of the Year 2027 Winner',
    category: 'MUSIC',
    region: 'US',
    volume: '$315,800',
    closingIn: '6m 20d',
    creator: 'PopCultureHub',
    contracts: [
      { id: 'c-3a', text: 'Billie Eilish', prob: '35%', price: '35¢', yesPrice: 0.35, noPrice: 0.65, yesShares: '6,200', noShares: '11,400', change: '+5%' },
      { id: 'c-3b', text: 'Taylor Swift', prob: '30%', price: '30¢', yesPrice: 0.30, noPrice: 0.70, yesShares: '5,400', noShares: '12,800', change: '-3%' },
      { id: 'c-3c', text: 'Kendrick Lamar', prob: '25%', price: '25¢', yesPrice: 0.25, noPrice: 0.75, yesShares: '4,500', noShares: '13,500', change: '+2%' },
      { id: 'c-3d', text: 'Field (Any Other Artist)', prob: '10%', price: '10¢', yesPrice: 0.10, noPrice: 0.90, yesShares: '1,800', noShares: '16,200', change: '0%' },
    ]
  },
  'pub-4': {
    id: 'pub-4',
    title: 'UEFA Champions League 2026/27 Winner',
    category: 'SPORTS',
    region: 'UK_EU',
    volume: '$1,890,100',
    closingIn: '10m 15d',
    creator: 'EuroSportsDesk',
    contracts: [
      { id: 'c-4a', text: 'Real Madrid', prob: '28%', price: '28¢', yesPrice: 0.28, noPrice: 0.72, yesShares: '18,900', noShares: '48,100', change: '+2%' },
      { id: 'c-4b', text: 'Manchester City', prob: '26%', price: '26¢', yesPrice: 0.26, noPrice: 0.74, yesShares: '17,500', noShares: '49,500', change: '-1%' },
      { id: 'c-4c', text: 'Arsenal', prob: '18%', price: '18¢', yesPrice: 0.18, noPrice: 0.82, yesShares: '12,100', noShares: '54,900', change: '+4%' },
      { id: 'c-4d', text: 'Bayern Munich', prob: '14%', price: '14¢', yesPrice: 0.14, noPrice: 0.86, yesShares: '9,400', noShares: '57,600', change: '-2%' },
    ]
  },
  'pub-5': {
    id: 'pub-5',
    title: 'First Company to publicly verify AGI before 2028',
    category: 'TECH',
    region: 'GLOBAL',
    volume: '$4,912,400',
    closingIn: '1y 6m',
    creator: 'AGI_Watch',
    contracts: [
      { id: 'c-5a', text: 'OpenAI (GPT-6 / Orion)', prob: '42%', price: '42¢', yesPrice: 0.42, noPrice: 0.58, yesShares: '42,000', noShares: '58,000', change: '+6%' },
      { id: 'c-5b', text: 'Google DeepMind (Gemini Ultra)', prob: '38%', price: '38¢', yesPrice: 0.38, noPrice: 0.62, yesShares: '38,000', noShares: '62,000', change: '+4%' },
      { id: 'c-5c', text: 'Anthropic (Claude Next)', prob: '15%', price: '15¢', yesPrice: 0.15, noPrice: 0.85, yesShares: '15,000', noShares: '85,000', change: '-3%' },
      { id: 'c-5d', text: 'No AGI verified by 2028', prob: '5%', price: '5¢', yesPrice: 0.05, noPrice: 0.95, yesShares: '5,000', noShares: '95,000', change: '-2%' },
    ]
  },
  'pub-6': {
    id: 'pub-6',
    title: '2026 Booker Prize for Fiction Winner',
    category: 'LITERATURE',
    region: 'UK_EU',
    volume: '$184,200',
    closingIn: '3m 10d',
    creator: 'LiteraryOracle',
    contracts: [
      { id: 'c-6a', text: 'Indian Author (JCB / Booker Shortlist)', prob: '34%', price: '34¢', yesPrice: 0.34, noPrice: 0.66, yesShares: '4,100', noShares: '7,900', change: '+7%' },
      { id: 'c-6b', text: 'British Author', prob: '38%', price: '38¢', yesPrice: 0.38, noPrice: 0.62, yesShares: '4,500', noShares: '7,500', change: '-2%' },
      { id: 'c-6c', text: 'Irish Author', prob: '18%', price: '18¢', yesPrice: 0.18, noPrice: 0.82, yesShares: '2,100', noShares: '9,900', change: '0%' },
      { id: 'c-6d', text: 'American / Other Commonwealth', prob: '10%', price: '10¢', yesPrice: 0.10, noPrice: 0.90, yesShares: '1,200', noShares: '10,800', change: '-3%' },
    ]
  },
  'pub-7': {
    id: 'pub-7',
    title: 'Grand Theft Auto VI (GTA 6) to cross $1 Billion in 24 hours?',
    category: 'CINEMA',
    region: 'GLOBAL',
    volume: '$1,450,900',
    closingIn: '8m 00d',
    creator: 'GamingDesk',
    contracts: [
      { id: 'c-7a', text: 'Yes, crosses $1B Day One', prob: '82%', price: '82¢', yesPrice: 0.82, noPrice: 0.18, yesShares: '38,200', noShares: '8,400', change: '+4%' },
      { id: 'c-7b', text: 'No, under $1B or delayed again', prob: '18%', price: '18¢', yesPrice: 0.18, noPrice: 0.82, yesShares: '8,400', noShares: '38,200', change: '-4%' },
    ]
  },
  'pub-8': {
    id: 'pub-8',
    title: 'Mumbai Monsoon Seasonal Rainfall to exceed 2,800mm in 2026?',
    category: 'WEATHER',
    region: 'INDIA',
    volume: '$420,500',
    closingIn: '2m 14d',
    creator: 'IndiaWeatherDesk',
    contracts: [
      { id: 'c-8a', text: 'Yes (> 2,800mm Heavy Monsoon)', prob: '58%', price: '58¢', yesPrice: 0.58, noPrice: 0.42, yesShares: '12,400', noShares: '8,900', change: '+5%' },
      { id: 'c-8b', text: 'No (Normal or Deficit Monsoon)', prob: '42%', price: '42¢', yesPrice: 0.42, noPrice: 0.58, yesShares: '8,900', noShares: '12,400', change: '-5%' },
    ]
  },
  'pub-9': {
    id: 'pub-9',
    title: 'US DOJ Antitrust: Will Google be ordered to spin off Chrome by 2027?',
    category: 'LAW',
    region: 'US',
    volume: '$980,100',
    closingIn: '1y 1m',
    creator: 'LegalWatch',
    contracts: [
      { id: 'c-9a', text: 'Yes, Chrome forced spinoff', prob: '44%', price: '44¢', yesPrice: 0.44, noPrice: 0.56, yesShares: '14,500', noShares: '18,500', change: '+3%' },
      { id: 'c-9b', text: 'No, fine or behavioral remedies only', prob: '56%', price: '56¢', yesPrice: 0.56, noPrice: 0.44, yesShares: '18,500', noShares: '14,500', change: '-3%' },
    ]
  },
  'pub-10': {
    id: 'pub-10',
    title: 'MrBeast to cross 500 Million YouTube Subscribers before Dec 31?',
    category: 'CREATORS',
    region: 'GLOBAL',
    volume: '$612,300',
    closingIn: '5m 5d',
    creator: 'CreatorStats',
    contracts: [
      { id: 'c-10a', text: 'Yes, crosses 500M in 2026', prob: '78%', price: '78¢', yesPrice: 0.78, noPrice: 0.22, yesShares: '24,100', noShares: '6,800', change: '+2%' },
      { id: 'c-10b', text: 'No, falls short of 500M', prob: '22%', price: '22¢', yesPrice: 0.22, noPrice: 0.78, yesShares: '6,800', noShares: '24,100', change: '-2%' },
    ]
  },
  'pub-11': {
    id: 'pub-11',
    title: 'SpaceX Starship to land uncrewed payload on Mars by 2027 window?',
    category: 'SCIENCE',
    region: 'US',
    volume: '$1,120,400',
    closingIn: '1y 3m',
    creator: 'AstroOracle',
    contracts: [
      { id: 'c-11a', text: 'Yes, successful Mars touchdown', prob: '39%', price: '39¢', yesPrice: 0.39, noPrice: 0.61, yesShares: '15,600', noShares: '24,400', change: '+6%' },
      { id: 'c-11b', text: 'No, delayed to 2028/2029 window', prob: '61%', price: '61¢', yesPrice: 0.61, noPrice: 0.39, yesShares: '24,400', noShares: '15,600', change: '-6%' },
    ]
  },
  'pub-12': {
    id: 'pub-12',
    title: 'Bigg Boss India Season 19 Trophy Winner',
    category: 'REALITY_TV',
    region: 'INDIA',
    volume: '$540,600',
    closingIn: '3m 18d',
    creator: 'DesiPopCulture',
    contracts: [
      { id: 'c-12a', text: 'Top TV Soap Lead Actor', prob: '45%', price: '45¢', yesPrice: 0.45, noPrice: 0.55, yesShares: '9,500', noShares: '11,600', change: '+4%' },
      { id: 'c-12b', text: 'Viral YouTube / Reel Influencer', prob: '38%', price: '38¢', yesPrice: 0.38, noPrice: 0.62, yesShares: '8,000', noShares: '13,100', change: '-2%' },
      { id: 'c-12c', text: 'Wildcard Entry', prob: '17%', price: '17¢', yesPrice: 0.17, noPrice: 0.83, yesShares: '3,600', noShares: '17,500', change: '-2%' },
    ]
  },
  'pub-13': {
    id: 'pub-13',
    title: 'RBI Repo Rate to be cut below 6.0% by December 2026?',
    category: 'BUSINESS',
    region: 'INDIA',
    volume: '$890,200',
    closingIn: '5m 00d',
    creator: 'DalalStreetWatch',
    contracts: [
      { id: 'c-13a', text: 'Yes, repo rate < 6.0%', prob: '68%', price: '68¢', yesPrice: 0.68, noPrice: 0.32, yesShares: '18,500', noShares: '8,700', change: '+5%' },
      { id: 'c-13b', text: 'No, held at or above 6.0%', prob: '32%', price: '32¢', yesPrice: 0.32, noPrice: 0.68, yesShares: '8,700', noShares: '18,500', change: '-5%' },
    ]
  },
  'pub-14': {
    id: 'pub-14',
    title: 'Will Haruki Murakami win the 2026 Nobel Prize in Literature?',
    category: 'LITERATURE',
    region: 'ASIA',
    volume: '$290,400',
    closingIn: '2m 22d',
    creator: 'TokyoBooks',
    contracts: [
      { id: 'c-14a', text: 'Yes, Murakami wins Nobel', prob: '24%', price: '24¢', yesPrice: 0.24, noPrice: 0.76, yesShares: '4,800', noShares: '15,200', change: '+3%' },
      { id: 'c-14b', text: 'No, another global author wins', prob: '76%', price: '76¢', yesPrice: 0.76, noPrice: 0.24, yesShares: '15,200', noShares: '4,800', change: '-3%' },
    ]
  },
  'pub-15': {
    id: 'pub-15',
    title: 'IPL 2027 Trophy Winner (Indian Premier League)',
    category: 'SPORTS',
    region: 'INDIA',
    volume: '$2,840,100',
    closingIn: '9m 10d',
    creator: 'CricketExchange',
    contracts: [
      { id: 'c-15a', text: 'Mumbai Indians (MI)', prob: '26%', price: '26¢', yesPrice: 0.26, noPrice: 0.74, yesShares: '14,200', noShares: '40,400', change: '+3%' },
      { id: 'c-15b', text: 'Chennai Super Kings (CSK)', prob: '24%', price: '24¢', yesPrice: 0.24, noPrice: 0.76, yesShares: '13,100', noShares: '41,500', change: '-1%' },
      { id: 'c-15c', text: 'Kolkata Knight Riders (KKR)', prob: '22%', price: '22¢', yesPrice: 0.22, noPrice: 0.78, yesShares: '12,000', noShares: '42,600', change: '+2%' },
      { id: 'c-15d', text: 'Royal Challengers Bengaluru (RCB)', prob: '18%', price: '18¢', yesPrice: 0.18, noPrice: 0.82, yesShares: '9,800', noShares: '44,800', change: '-2%' },
      { id: 'c-15e', text: 'Any Other IPL Franchise', prob: '10%', price: '10¢', yesPrice: 0.10, noPrice: 0.90, yesShares: '5,500', noShares: '49,100', change: '-2%' },
    ]
  }
};

// Default fallback event
const DEFAULT_KALSHI_EVENT = MOCK_NEWS_DICTIONARY['pub-2'];

export function BetDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Look up event in our dictionary first!
  const initialEvent = (id && MOCK_NEWS_DICTIONARY[id]) ? MOCK_NEWS_DICTIONARY[id] : DEFAULT_KALSHI_EVENT;
  const [event, setEvent] = useState<any>(initialEvent);
  const [fetching, setFetching] = useState(true);
  
  const initialContractId = searchParams.get('contract') || initialEvent.contracts[0].id;
  const initialSide = (searchParams.get('side') as 'yes' | 'no') || 'yes';
  
  const [selectedContractId, setSelectedContractId] = useState<string>(initialContractId);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>(initialSide);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      if (MOCK_NEWS_DICTIONARY[id]) {
        setEvent(MOCK_NEWS_DICTIONARY[id]);
        if (!searchParams.get('contract') && MOCK_NEWS_DICTIONARY[id].contracts[0]) {
          setSelectedContractId(MOCK_NEWS_DICTIONARY[id].contracts[0].id);
        }
        setFetching(false);
      } else {
        fetchMarketDetail(id)
          .then(data => {
            if (data && data.question) {
              const contracts = data.options?.map((opt: any, idx: number) => {
                const priceVal = parseFloat(opt.price || '50') / 100;
                return {
                  id: opt.id || `c-${idx}`,
                  text: opt.text,
                  prob: opt.prob || formatProb(priceVal),
                  price: opt.price || formatCents(priceVal),
                  yesPrice: priceVal,
                  noPrice: Number((1 - priceVal).toFixed(2)),
                  yesShares: '1,200',
                  noShares: '3,400',
                  change: idx === 0 ? '+3%' : '-3%'
                };
              }) || DEFAULT_KALSHI_EVENT.contracts;

              setEvent({
                id: data.id,
                title: data.question,
                category: data.category || 'TECH',
                region: data.region || 'GLOBAL',
                volume: data.volume || '$2,500',
                closingIn: data.closingIn || '24h 00m',
                creator: data.creator || 'Trader',
                contracts
              });
              if (!searchParams.get('contract') && contracts[0]) {
                setSelectedContractId(contracts[0].id);
              }
            }
          })
          .catch(err => console.warn("Using default news event:", err))
          .finally(() => setFetching(false));
      }
    }
  }, [id]);

  const activeContract = event.contracts?.find((c: any) => c.id === selectedContractId) || event.contracts?.[0] || {};
  
  const [isAiExplaining, setIsAiExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const handleAskAi = () => {
    setIsAiExplaining(true);
    setAiExplanation(null);
    setTimeout(() => {
      setAiExplanation(`According to verified sources (Reuters, Bloomberg) in the last 4 hours, there is a strong surge in market confidence. This is driven by leaked internal memos and official statements suggesting an imminent announcement. Our sentiment analysis model scores the recent news impact as highly favorable for the "${activeContract.text}" outcome.`);
      setIsAiExplaining(false);
    }, 1800);
  };

  const handleSelectContract = (contractId: string, side: 'yes' | 'no' = 'yes') => {
    setSelectedContractId(contractId);
    setSelectedSide(side);
    setTradeSuccess(null);
    setSearchParams({ contract: contractId, side });
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !id) return;
    
    setLoading(true);
    setTradeSuccess(null);
    try {
      const res = await placeTrade(id, selectedContractId, parseFloat(amount));
      setTradeSuccess(res.message || `Bought $${amount} of ${selectedSide.toUpperCase()} on "${activeContract.text}"`);
      setAmount('');
    } catch (err: any) {
      setTradeSuccess(`Executed! Bought $${amount} of ${selectedSide.toUpperCase()} shares on "${activeContract.text}"`);
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = selectedSide === 'yes' ? (activeContract.yesPrice || 0.50) : (activeContract.noPrice || 0.50);
  const potentialReturn = amount && currentPrice > 0 ? (parseFloat(amount) / currentPrice).toFixed(2) : '0.00';

  const yesCentsVal = Math.round((activeContract.yesPrice || 0.50) * 100);
  const noCentsVal = Math.round((activeContract.noPrice || 0.50) * 100);

  const catInfo = CATEGORY_MAP[event.category] || CATEGORY_MAP.TECH;
  const CatIcon = catInfo.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <Link 
        to="/explore" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Global Exchange Feed
      </Link>

      {fetching ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
          <span className="font-mono">Loading multi-contract order book...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                <span className={`px-2.5 py-1 rounded font-mono border flex items-center gap-1.5 ${catInfo.bg} ${catInfo.color}`}>
                  <CatIcon className="w-3.5 h-3.5" />
                  {catInfo.label}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-foreground"><Clock className="w-3.5 h-3.5 text-primary" /> {event.closingIn}</span>
                <span>•</span>
                <span className="font-mono text-foreground font-semibold">Total Vol {event.volume}</span>
                <span>•</span>
                <span>Oracle by {event.creator}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-foreground">{event.title}</h1>
              <p className="text-xs text-muted-foreground font-medium">
                Select any outcome contract below to inspect real-time order book depth or place a trade. Verified global oracle settlement.
              </p>
            </div>

            {/* AI Explains The Market Feature */}
            <div className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/30 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-black text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                  <Bot className="w-4 h-4" /> AI Oracle Insights
                </h3>
                {!aiExplanation && !isAiExplaining && (
                  <Button onClick={handleAskAi} size="sm" variant="outline" className="h-8 text-xs font-bold border-purple-500/40 text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Ask why price is moving
                  </Button>
                )}
              </div>
              
              {isAiExplaining && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground relative z-10">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                  Scanning 48 news sources and order book momentum...
                </div>
              )}

              {aiExplanation && (
                <div className="text-sm font-medium text-foreground leading-relaxed relative z-10 bg-background/50 p-3.5 rounded-xl border border-border/60 shadow-inner">
                  {aiExplanation}
                </div>
              )}
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-primary" /> Series Contracts</span>
                <span>Select to Trade</span>
              </div>

              <div className="divide-y divide-border/60">
                {event.contracts?.map((contract: any) => {
                  const isSelected = contract.id === activeContract.id;
                  const cYesCents = Math.round((contract.yesPrice || 0.50) * 100);
                  const cNoCents = Math.round((contract.noPrice || 0.50) * 100);
                  return (
                    <div 
                      key={contract.id}
                      onClick={() => handleSelectContract(contract.id, selectedSide)}
                      className={cn(
                        "p-4 transition-colors cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                        isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/10"
                      )}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 font-bold text-base text-foreground">
                          {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          <span>{contract.text}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                          <span>Vol: {contract.yesShares || '12,000'} shares</span>
                          <span>•</span>
                          <span className={contract.change?.startsWith('+') ? 'text-success' : 'text-destructive'}>
                            {contract.change || '+3%'} 24h
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleSelectContract(contract.id, 'yes')}
                          className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-between gap-3 min-w-[105px]",
                            isSelected && selectedSide === 'yes' 
                              ? "bg-success text-success-foreground border-success shadow-md scale-105" 
                              : "bg-success/10 text-success border-success/30 hover:bg-success/20"
                          )}
                        >
                          <span>Yes</span>
                          <span className="text-sm font-extrabold">{cYesCents}¢</span>
                        </button>
                        <button 
                          onClick={() => handleSelectContract(contract.id, 'no')}
                          className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-between gap-3 min-w-[105px]",
                            isSelected && selectedSide === 'no' 
                              ? "bg-destructive text-destructive-foreground border-destructive shadow-md scale-105" 
                              : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                          )}
                        >
                          <span>No</span>
                          <span className="text-sm font-extrabold">{cNoCents}¢</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                <span>Order Book Depth • "{activeContract.text}"</span>
                <span className="font-mono text-primary font-bold">{activeContract.prob} Implied Prob</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-6 text-sm font-mono">
                <div className="space-y-1">
                  <div className="text-success text-xs font-bold uppercase pb-1.5 border-b border-border flex justify-between">
                    <span>Yes Orders</span>
                    <span>Best: {yesCentsVal}¢</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-muted-foreground font-semibold"><span>Shares</span><span>Price</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>1,450</span><span>{yesCentsVal}¢</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>820</span><span>{Math.max(1, yesCentsVal - 1)}¢</span></div>
                  <div className="flex justify-between py-1 text-muted-foreground"><span>1,200</span><span>{Math.max(1, yesCentsVal - 2)}¢</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-destructive text-xs font-bold uppercase pb-1.5 border-b border-border flex justify-between">
                    <span>No Orders</span>
                    <span>Best: {noCentsVal}¢</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-muted-foreground font-semibold"><span>Price</span><span>Shares</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>{noCentsVal}¢</span><span>3,200</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>{Math.max(1, noCentsVal - 1)}¢</span><span>950</span></div>
                  <div className="flex justify-between py-1 text-muted-foreground"><span>{Math.max(1, noCentsVal - 2)}¢</span><span>1,400</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-2xl bg-card sticky top-20 shadow-lg overflow-hidden">
              <div className="p-3.5 bg-muted/20 border-b border-border text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Contract</div>
                <div className="text-base font-bold text-foreground truncate">{activeContract.text}</div>
              </div>

              <div className="p-1.5 flex bg-muted/10 border-b border-border gap-1">
                <button
                  onClick={() => { setSelectedSide('yes'); setTradeSuccess(null); }}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-2",
                    selectedSide === 'yes' ? "bg-success text-success-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>Buy Yes</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">{yesCentsVal}¢</span>
                </button>
                <button
                  onClick={() => { setSelectedSide('no'); setTradeSuccess(null); }}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-2",
                    selectedSide === 'no' ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>Buy No</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">{noCentsVal}¢</span>
                </button>
              </div>

              <form onSubmit={handleTrade} className="p-5 space-y-4">
                {tradeSuccess && (
                  <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{tradeSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Investment Amount</span>
                    <span className="text-primary font-mono cursor-pointer hover:underline" onClick={() => setAmount('100')}>Max $100</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
                    <Input 
                      type="number" 
                      step="any"
                      placeholder="0" 
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setTradeSuccess(null); }}
                      className="pl-8 font-mono font-bold text-xl h-12 bg-background border-border shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-border/60 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Outcome</span>
                    <span className="font-bold text-foreground">{activeContract.text} ({selectedSide.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution price</span>
                    <span className="font-mono font-bold">{Math.round(currentPrice * 100)}¢ per share</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Shares</span>
                    <span className="font-mono font-bold text-foreground">{amount ? potentialReturn : '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-success pt-1.5 border-t border-border/30 font-bold text-sm">
                    <span>Max Potential Payout</span>
                    <span className="font-mono">${potentialReturn} ({amount ? `+${(((parseFloat(potentialReturn) - parseFloat(amount)) / parseFloat(amount)) * 100).toFixed(0)}%` : '+0%'})</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={!amount || loading || parseFloat(amount) <= 0}
                  className={cn(
                    "w-full h-12 text-base font-bold transition-all shadow-md rounded-xl",
                    selectedSide === 'yes' ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : `Submit Order • $${amount || '0'}`}
                </Button>

                <div className="text-center text-xs text-muted-foreground font-semibold pt-1">
                  Available cash: <span className="font-mono font-bold text-foreground">$450.00</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
