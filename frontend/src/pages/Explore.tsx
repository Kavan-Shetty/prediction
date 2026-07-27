import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Clock, Plus, Search, Filter, Trash2, Loader2, ChevronRight, Landmark, Trophy, Music, Briefcase, Cpu, Flame, Globe, Lock, ShieldCheck, Film, CloudRain, Scale, Video, Rocket, Crown, BookOpen, MapPin } from 'lucide-react';
import { createMarket } from '../lib/api';

// 13 Master Categories covering Cultural, Scientific, Legal, and Economic predictions
const CATEGORIES = [
  { id: 'ALL', label: 'All Topics', icon: Flame, color: 'text-orange-500' },
  { id: 'POLITICS', label: 'Politics', icon: Landmark, color: 'text-blue-500' },
  { id: 'SPORTS', label: 'Sports', icon: Trophy, color: 'text-amber-500' },
  { id: 'BUSINESS', label: 'Economy', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'TECH', label: 'AI & Crypto', icon: Cpu, color: 'text-cyan-500' },
  { id: 'MUSIC', label: 'Music', icon: Music, color: 'text-purple-500' },
  { id: 'LITERATURE', label: 'Literature', icon: BookOpen, color: 'text-indigo-500' },
  { id: 'CINEMA', label: 'Cinema & Gaming', icon: Film, color: 'text-pink-500' },
  { id: 'WEATHER', label: 'Weather', icon: CloudRain, color: 'text-sky-500' },
  { id: 'LAW', label: 'Law & Regs', icon: Scale, color: 'text-yellow-500' },
  { id: 'CREATORS', label: 'Creators', icon: Video, color: 'text-rose-500' },
  { id: 'SCIENCE', label: 'Science & Space', icon: Rocket, color: 'text-teal-500' },
  { id: 'REALITY_TV', label: 'Reality TV', icon: Crown, color: 'text-violet-500' },
];

// Top 50 Countries Region Hierarchy
const REGIONS = [
  { id: 'GLOBAL', label: '🌐 All Global (50 Nations)', flag: '🌐' },
  { id: 'INDIA', label: '🇮🇳 India & South Asia', flag: '🇮🇳' },
  { id: 'US', label: '🇺🇸 Americas (US/Brazil/Mexico)', flag: '🇺🇸' },
  { id: 'UK_EU', label: '🇬🇧 Europe & UK (UK/France/Germany)', flag: '🇬🇧' },
  { id: 'ASIA', label: '🇯🇵 Asia-Pacific (Japan/Korea/Aus)', flag: '🇯🇵' },
  { id: 'MEA', label: '🌍 Middle East & Africa (UAE/SA/ZA)', flag: '🌍' },
];

// Rich 15-Market Dataset across 50 Countries & 13 Categories
const PUBLIC_EVENTS = [
  {
    id: 'pub-1',
    title: 'US 2028 Presidential Election Winner',
    category: 'POLITICS',
    region: 'US',
    volume: '$3,450,200',
    closingIn: '2y 4m',
    creator: 'Predictor Official',
    contracts: [
      { id: 'c-1a', text: 'Gavin Newsom', prob: '32%', price: '32¢', yesPrice: '32¢', noPrice: '68¢' },
      { id: 'c-1b', text: 'JD Vance', prob: '28%', price: '28¢', yesPrice: '28¢', noPrice: '72¢' },
      { id: 'c-1c', text: 'Josh Shapiro', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c-1d', text: 'Any Other Candidate', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
    ]
  },
  {
    id: 'pub-2',
    title: 'Bitcoin (BTC) to touch $150,000 before Q4 2026?',
    category: 'TECH',
    region: 'GLOBAL',
    volume: '$2,148,500',
    closingIn: '4m 12h',
    creator: 'CryptoOracle',
    contracts: [
      { id: 'c-2a', text: 'Yes, touches $150k+', prob: '64%', price: '64¢', yesPrice: '64¢', noPrice: '36¢' },
      { id: 'c-2b', text: 'No, stays below $150k', prob: '36%', price: '36¢', yesPrice: '36¢', noPrice: '64¢' },
    ]
  },
  {
    id: 'pub-3',
    title: 'Grammy Album of the Year 2027 Winner',
    category: 'MUSIC',
    region: 'US',
    volume: '$315,800',
    closingIn: '6m 20d',
    creator: 'PopCultureHub',
    contracts: [
      { id: 'c-3a', text: 'Billie Eilish', prob: '35%', price: '35¢', yesPrice: '35¢', noPrice: '65¢' },
      { id: 'c-3b', text: 'Taylor Swift', prob: '30%', price: '30¢', yesPrice: '30¢', noPrice: '70¢' },
      { id: 'c-3c', text: 'Kendrick Lamar', prob: '25%', price: '25¢', yesPrice: '25¢', noPrice: '75¢' },
      { id: 'c-3d', text: 'Field (Any Other Artist)', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  },
  {
    id: 'pub-4',
    title: 'UEFA Champions League 2026/27 Winner',
    category: 'SPORTS',
    region: 'UK_EU',
    volume: '$1,890,100',
    closingIn: '10m 15d',
    creator: 'EuroSportsDesk',
    contracts: [
      { id: 'c-4a', text: 'Real Madrid', prob: '28%', price: '28¢', yesPrice: '28¢', noPrice: '72¢' },
      { id: 'c-4b', text: 'Manchester City', prob: '26%', price: '26¢', yesPrice: '26¢', noPrice: '74¢' },
      { id: 'c-4c', text: 'Arsenal', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c-4d', text: 'Bayern Munich', prob: '14%', price: '14¢', yesPrice: '14¢', noPrice: '86¢' },
    ]
  },
  {
    id: 'pub-5',
    title: 'First Company to publicly verify AGI before 2028',
    category: 'TECH',
    region: 'GLOBAL',
    volume: '$4,912,400',
    closingIn: '1y 6m',
    creator: 'AGI_Watch',
    contracts: [
      { id: 'c-5a', text: 'OpenAI (GPT-6 / Orion)', prob: '42%', price: '42¢', yesPrice: '42¢', noPrice: '58¢' },
      { id: 'c-5b', text: 'Google DeepMind (Gemini Ultra)', prob: '38%', price: '38¢', yesPrice: '38¢', noPrice: '62¢' },
      { id: 'c-5c', text: 'Anthropic (Claude Next)', prob: '15%', price: '15¢', yesPrice: '15¢', noPrice: '85¢' },
      { id: 'c-5d', text: 'No AGI verified by 2028', prob: '5%', price: '5¢', yesPrice: '5¢', noPrice: '95¢' },
    ]
  },
  {
    id: 'pub-6',
    title: '2026 Booker Prize for Fiction Winner',
    category: 'LITERATURE',
    region: 'UK_EU',
    volume: '$184,200',
    closingIn: '3m 10d',
    creator: 'LiteraryOracle',
    contracts: [
      { id: 'c-6a', text: 'Indian Author (JCB / Booker Shortlist)', prob: '34%', price: '34¢', yesPrice: '34¢', noPrice: '66¢' },
      { id: 'c-6b', text: 'British Author', prob: '38%', price: '38¢', yesPrice: '38¢', noPrice: '62¢' },
      { id: 'c-6c', text: 'Irish Author', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c-6d', text: 'American / Other Commonwealth', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  },
  {
    id: 'pub-7',
    title: 'Grand Theft Auto VI (GTA 6) to cross $1 Billion in 24 hours?',
    category: 'CINEMA',
    region: 'GLOBAL',
    volume: '$1,450,900',
    closingIn: '8m 00d',
    creator: 'GamingDesk',
    contracts: [
      { id: 'c-7a', text: 'Yes, crosses $1B Day One', prob: '82%', price: '82¢', yesPrice: '82¢', noPrice: '18¢' },
      { id: 'c-7b', text: 'No, under $1B or delayed again', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
    ]
  },
  {
    id: 'pub-8',
    title: 'Mumbai Monsoon Seasonal Rainfall to exceed 2,800mm in 2026?',
    category: 'WEATHER',
    region: 'INDIA',
    volume: '$420,500',
    closingIn: '2m 14d',
    creator: 'IndiaWeatherDesk',
    contracts: [
      { id: 'c-8a', text: 'Yes (> 2,800mm Heavy Monsoon)', prob: '58%', price: '58¢', yesPrice: '58¢', noPrice: '42¢' },
      { id: 'c-8b', text: 'No (Normal or Deficit Monsoon)', prob: '42%', price: '42¢', yesPrice: '42¢', noPrice: '58¢' },
    ]
  },
  {
    id: 'pub-9',
    title: 'US DOJ Antitrust: Will Google be ordered to spin off Chrome by 2027?',
    category: 'LAW',
    region: 'US',
    volume: '$980,100',
    closingIn: '1y 1m',
    creator: 'LegalWatch',
    contracts: [
      { id: 'c-9a', text: 'Yes, Chrome forced spinoff', prob: '44%', price: '44¢', yesPrice: '44¢', noPrice: '56¢' },
      { id: 'c-9b', text: 'No, fine or behavioral remedies only', prob: '56%', price: '56¢', yesPrice: '56¢', noPrice: '44¢' },
    ]
  },
  {
    id: 'pub-10',
    title: 'MrBeast to cross 500 Million YouTube Subscribers before Dec 31?',
    category: 'CREATORS',
    region: 'GLOBAL',
    volume: '$612,300',
    closingIn: '5m 5d',
    creator: 'CreatorStats',
    contracts: [
      { id: 'c-10a', text: 'Yes, crosses 500M in 2026', prob: '78%', price: '78¢', yesPrice: '78¢', noPrice: '22¢' },
      { id: 'c-10b', text: 'No, falls short of 500M', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
    ]
  },
  {
    id: 'pub-11',
    title: 'SpaceX Starship to land uncrewed payload on Mars by 2027 window?',
    category: 'SCIENCE',
    region: 'US',
    volume: '$1,120,400',
    closingIn: '1y 3m',
    creator: 'AstroOracle',
    contracts: [
      { id: 'c-11a', text: 'Yes, successful Mars touchdown', prob: '39%', price: '39¢', yesPrice: '39¢', noPrice: '61¢' },
      { id: 'c-11b', text: 'No, delayed to 2028/2029 window', prob: '61%', price: '61¢', yesPrice: '61¢', noPrice: '39¢' },
    ]
  },
  {
    id: 'pub-12',
    title: 'Bigg Boss India Season 19 Trophy Winner',
    category: 'REALITY_TV',
    region: 'INDIA',
    volume: '$540,600',
    closingIn: '3m 18d',
    creator: 'DesiPopCulture',
    contracts: [
      { id: 'c-12a', text: 'Top TV Soap Lead Actor', prob: '45%', price: '45¢', yesPrice: '45¢', noPrice: '55¢' },
      { id: 'c-12b', text: 'Viral YouTube / Reel Influencer', prob: '38%', price: '38¢', yesPrice: '38¢', noPrice: '62¢' },
      { id: 'c-12c', text: 'Wildcard Entry', prob: '17%', price: '17¢', yesPrice: '17¢', noPrice: '83¢' },
    ]
  },
  {
    id: 'pub-13',
    title: 'RBI Repo Rate to be cut below 6.0% by December 2026?',
    category: 'BUSINESS',
    region: 'INDIA',
    volume: '$890,200',
    closingIn: '5m 00d',
    creator: 'DalalStreetWatch',
    contracts: [
      { id: 'c-13a', text: 'Yes, repo rate < 6.0%', prob: '68%', price: '68¢', yesPrice: '68¢', noPrice: '32¢' },
      { id: 'c-13b', text: 'No, held at or above 6.0%', prob: '32%', price: '32¢', yesPrice: '32¢', noPrice: '68¢' },
    ]
  },
  {
    id: 'pub-14',
    title: 'Will Haruki Murakami win the 2026 Nobel Prize in Literature?',
    category: 'LITERATURE',
    region: 'ASIA',
    volume: '$290,400',
    closingIn: '2m 22d',
    creator: 'TokyoBooks',
    contracts: [
      { id: 'c-14a', text: 'Yes, Murakami wins Nobel', prob: '24%', price: '24¢', yesPrice: '24¢', noPrice: '76¢' },
      { id: 'c-14b', text: 'No, another global author wins', prob: '76%', price: '76¢', yesPrice: '76¢', noPrice: '24¢' },
    ]
  },
  {
    id: 'pub-15',
    title: 'IPL 2027 Trophy Winner (Indian Premier League)',
    category: 'SPORTS',
    region: 'INDIA',
    volume: '$2,840,100',
    closingIn: '9m 10d',
    creator: 'CricketExchange',
    contracts: [
      { id: 'c-15a', text: 'Mumbai Indians (MI)', prob: '26%', price: '26¢', yesPrice: '26¢', noPrice: '74¢' },
      { id: 'c-15b', text: 'Chennai Super Kings (CSK)', prob: '24%', price: '24¢', yesPrice: '24¢', noPrice: '76¢' },
      { id: 'c-15c', text: 'Kolkata Knight Riders (KKR)', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
      { id: 'c-15d', text: 'Royal Challengers Bengaluru (RCB)', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c-15e', text: 'Any Other IPL Franchise', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  }
];

export function Explore() {
  const [events, setEvents] = useState<any[]>(PUBLIC_EVENTS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeRegion, setActiveRegion] = useState<string>('GLOBAL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create Modal state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [selectedModalCategory, setSelectedModalCategory] = useState('POLITICS');
  const [selectedModalRegion, setSelectedModalRegion] = useState('GLOBAL');
  const [marketScope, setMarketScope] = useState<'public' | 'private'>('public');
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const [contracts, setContracts] = useState([{ text: 'Option A (Yes)' }, { text: 'Option B (No)' }]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || contracts.some(c => !c.text.trim())) return;
    
    setLoading(true);
    try {
      if (marketScope === 'private') {
        await createMarket(selectedGroupId, eventTitle, contracts);
        alert(`Private betting market listed in Group #${selectedGroupId}! Switch to Private Groups tab to view it.`);
      } else {
        const newEvent = {
          id: `pub-${Math.random().toString(36).substr(2, 6)}`,
          title: eventTitle,
          category: selectedModalCategory,
          region: selectedModalRegion,
          volume: '$0',
          closingIn: '30d 00h',
          creator: 'You',
          isPublic: true,
          contracts: contracts.map((c, idx) => {
            const defaultProb = Math.floor(100 / contracts.length);
            return {
              id: `mock-c-${idx}`,
              text: c.text,
              prob: `${defaultProb}%`,
              price: `${defaultProb}¢`,
              yesPrice: `${defaultProb}¢`,
              noPrice: `${100 - defaultProb}¢`
            };
          })
        };
        setEvents([newEvent, ...events]);
      }
      setEventTitle('');
      setContracts([{ text: 'Option A' }, { text: 'Option B' }]);
      setIsCreateEventOpen(false);
    } catch (err) {
      console.error(err);
      setIsCreateEventOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this public market?")) return;
    
    setDeletingId(eventId);
    try {
      setEvents(events.filter(ev => ev.id !== eventId));
    } finally {
      setDeletingId(null);
    }
  };

  const addContractOption = () => {
    if (contracts.length < 6) {
      setContracts([...contracts, { text: `Option ${String.fromCharCode(65 + contracts.length)}` }]);
    }
  };

  // Filter events by Region, Category, and Search Query
  const filteredEvents = events.filter(ev => {
    const matchesRegion = activeRegion === 'GLOBAL' || ev.region === activeRegion || ev.region === 'GLOBAL';
    const matchesCat = activeCategory === 'ALL' || ev.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.contracts?.some((c: any) => c.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Global Exchange Hero Banner */}
      <div className="bg-gradient-to-r from-card via-card/95 to-primary/15 border border-border rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-extrabold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            Top 50 Countries • 13 Master Categories
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            Trade on the Future of Everything.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            From India IPL to UK Booker Prizes, US Elections, Weather, and AI breakthroughs. Predict verifiable global outcomes or create an invite-only <Link to="/groups" className="text-primary font-bold hover:underline">Private Friend Group</Link>!
          </p>
        </div>
        
        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/60">
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">24h Global Volume</div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-success">$18,450,900</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/groups">
              <Button variant="outline" className="h-10 px-4 text-xs font-bold border-border bg-card hover:bg-muted/30 flex items-center gap-1.5 w-full sm:w-auto shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Private Groups
              </Button>
            </Link>
            <Button className="h-10 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center gap-2 w-full sm:w-auto" onClick={() => setIsCreateEventOpen(true)}>
              <Plus className="w-4 h-4" />
              List Market
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Tier Navigation: Layer 1 Country/Region Filter */}
      <div className="space-y-3 bg-card/60 p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Select Jurisdiction / Region (Top 50 Countries Scope):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {REGIONS.map(reg => {
            const isSel = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isSel
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                    : 'bg-background text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Layer 2: 13 Master Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-border/40">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'ALL' 
              ? events.filter(ev => activeRegion === 'GLOBAL' || ev.region === activeRegion || ev.region === 'GLOBAL').length 
              : events.filter(e => e.category === cat.id && (activeRegion === 'GLOBAL' || e.region === activeRegion || e.region === 'GLOBAL')).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                  isActive 
                    ? 'bg-foreground text-background border-foreground shadow-sm scale-[1.02]' 
                    : 'bg-background text-muted-foreground border-border/60 hover:border-border hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : cat.color}`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive ? 'bg-black/20 text-background' : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search India IPL, US Election, Booker Prize, GTA 6, Weather, AGI..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card rounded-xl border-border text-sm font-medium shadow-2xs" 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 px-4 border-border font-semibold text-xs flex items-center gap-1.5 bg-card">
            <Filter className="w-3.5 h-3.5" /> Filter ({filteredEvents.length})
          </Button>
        </div>
      </div>

      {/* Public Exchange Feed */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No markets found in this jurisdiction / category</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try switching to 'All Global' or select another category from our 13 Master Categories!
          </p>
          <Button onClick={() => setIsCreateEventOpen(true)} className="mt-2 text-xs font-bold bg-primary text-primary-foreground">
            List First Market in this Region
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => {
            const catMeta = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[1];
            const regMeta = REGIONS.find(r => r.id === event.region) || REGIONS[0];
            const CatIcon = catMeta.icon;
            return (
              <div 
                key={event.id} 
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-primary/50 transition-all shadow-sm relative group overflow-hidden"
              >
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-border/60">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted/40 text-foreground rounded-md font-mono border border-border/60 flex items-center gap-1.5">
                        <CatIcon className={`w-3 h-3 ${catMeta.color}`} />
                        {catMeta.label}
                      </span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-mono border border-primary/20 flex items-center gap-1">
                        {regMeta.flag} {regMeta.id === 'GLOBAL' ? 'Global' : regMeta.id}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary"><Clock className="w-3 h-3" /> {event.closingIn}</span>
                      <span>•</span>
                      <span className="font-mono text-foreground font-semibold">Vol {event.volume}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-mono"><ShieldCheck className="w-3 h-3" /> Verified Oracle</span>
                    </div>
                    <Link to={`/bets/${event.id}`} className="block">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {event.title}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </h2>
                    </Link>
                  </div>

                  {event.creator === 'You' && (
                    <button
                      onClick={(e) => handleDeleteEvent(e, event.id)}
                      disabled={deletingId === event.id}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-lg border border-transparent hover:border-destructive/30 hover:bg-destructive/10 transition-all text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      {deletingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>

                {/* Multi-Contract List */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 flex justify-between">
                    <span>Prediction Outcomes ({event.contracts?.length || 0})</span>
                    <span className="hidden sm:inline">Live Order Book Prices</span>
                  </div>

                  <div className="grid gap-2.5">
                    {event.contracts?.map((contract: any, idx: number) => {
                      const probNum = parseInt(contract.prob || '50');
                      return (
                        <div 
                          key={contract.id || idx}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-xl bg-background/60 border border-border/40 hover:border-border transition-colors gap-3"
                        >
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex justify-between items-center text-sm font-bold text-foreground mb-1.5">
                              <span className="truncate pr-2">{contract.text}</span>
                              <span className="font-mono text-primary font-extrabold">{contract.prob}</span>
                            </div>
                            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.max(5, probNum))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end pt-1 sm:pt-0 border-t sm:border-0 border-border/40">
                            <Link 
                              to={`/bets/${event.id}?contract=${contract.id}&side=yes`}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-success/15 hover:bg-success/25 border border-success/30 text-success text-xs font-bold font-mono flex items-center justify-between gap-3 min-w-[95px] transition-all shadow-2xs"
                            >
                              <span>Yes</span>
                              <span className="text-sm font-extrabold">{contract.yesPrice || contract.price}</span>
                            </Link>
                            <Link 
                              to={`/bets/${event.id}?contract=${contract.id}&side=no`}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 text-destructive text-xs font-bold font-mono flex items-center justify-between gap-3 min-w-[95px] transition-all shadow-2xs"
                            >
                              <span>No</span>
                              <span className="text-sm font-extrabold">{contract.noPrice || `${100 - probNum}¢`}</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border/40 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-primary" /> Public exchange contract • Verified oracle settlement
                  </span>
                  <Link to={`/bets/${event.id}`} className="text-primary font-bold hover:underline flex items-center gap-1">
                    View order book depth & charts <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Market Modal */}
      <Dialog
        isOpen={isCreateEventOpen}
        onClose={() => !loading && setIsCreateEventOpen(false)}
        title="List Prediction Series"
        description="Launch a prediction market across our 13 Master Categories and 50 Countries."
      >
        <form onSubmit={handleCreateEvent} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Market Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMarketScope('public')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  marketScope === 'public'
                    ? 'bg-primary/15 border-primary text-primary shadow-2xs'
                    : 'bg-muted/10 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div>Global Public Feed</div>
                  <div className="text-[10px] font-normal opacity-80">Visible to all users</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMarketScope('private')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  marketScope === 'private'
                    ? 'bg-primary/15 border-primary text-primary shadow-2xs'
                    : 'bg-muted/10 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div>Private Group Only</div>
                  <div className="text-[10px] font-normal opacity-80">Invite-only friends</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jurisdiction / Region</label>
              <select
                value={selectedModalRegion}
                onChange={(e) => setSelectedModalRegion(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-xs font-bold focus:outline-none focus:border-primary"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.flag} {r.id}</option>
                ))}
              </select>
            </div>

            {marketScope === 'private' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-background border border-border text-xs font-bold focus:outline-none focus:border-primary"
                >
                  <option value="1">🔒 The Boys (8 members)</option>
                  <option value="2">🔒 Office Predictions (12 members)</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Topic / Question</label>
            <Input 
              placeholder="e.g. India IPL Winner, Booker Prize, GTA 6 Box Office, US Election..." 
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              required
              className="font-semibold h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Category (13 Topics)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-border/40 rounded-xl bg-background/50">
              {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => {
                const Icon = cat.icon;
                const isSel = selectedModalCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedModalCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all text-left ${
                      isSel 
                        ? 'bg-primary/15 border-primary text-primary font-extrabold shadow-2xs' 
                        : 'bg-muted/10 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-primary' : cat.color}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prediction Outcomes ({contracts.length})
              </label>
              {contracts.length < 6 && (
                <button 
                  type="button" 
                  onClick={addContractOption} 
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Outcome Contract
                </button>
              )}
            </div>
            
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {contracts.map((contract, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-muted/10 p-2 rounded border border-border/50">
                  <span className="font-mono text-xs font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                  <Input 
                    value={contract.text} 
                    onChange={(e) => {
                      const newC = [...contracts]; newC[idx].text = e.target.value; setContracts(newC);
                    }} 
                    placeholder={`Outcome name e.g. Candidate ${idx + 1}, Option ${idx + 1}`}
                    className="h-9 text-sm font-medium" 
                    required 
                  />
                  {contracts.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => setContracts(contracts.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)} disabled={loading} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!eventTitle.trim() || contracts.some(c => !c.text.trim()) || loading} 
              className="h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {marketScope === 'public' ? 'List Global Market' : 'List in Private Group'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
