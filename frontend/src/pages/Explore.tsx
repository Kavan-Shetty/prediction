import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Clock, Users, Plus, Search, Filter, Trash2, Loader2, ChevronRight, TrendingUp, Layers, Landmark, Trophy, Music, Briefcase, Cpu, Flame, Globe, Lock, ShieldCheck } from 'lucide-react';
import { fetchGroupMarkets, createMarket, deleteMarket } from '../lib/api';

// Standardized Real-Time Categories
const CATEGORIES = [
  { id: 'ALL', label: 'Trending', icon: Flame, color: 'text-orange-500' },
  { id: 'POLITICS', label: 'Politics', icon: Landmark, color: 'text-blue-500' },
  { id: 'SPORTS', label: 'Sports', icon: Trophy, color: 'text-amber-500' },
  { id: 'BUSINESS', label: 'Business & Economy', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'MUSIC', label: 'Music & Culture', icon: Music, color: 'text-purple-500' },
  { id: 'TECH', label: 'Crypto & AI', icon: Cpu, color: 'text-cyan-500' },
];

// Rich Polymarket Public Dataset
const PUBLIC_EVENTS = [
  {
    id: 'pub-1',
    title: 'US 2028 Presidential Election Winner',
    category: 'POLITICS',
    volume: '$3,450,200',
    closingIn: '2y 4m',
    creator: 'Predictor Official',
    isPublic: true,
    contracts: [
      { id: 'c4', text: 'Gavin Newsom', prob: '32%', price: '32¢', yesPrice: '32¢', noPrice: '68¢' },
      { id: 'c5', text: 'JD Vance', prob: '28%', price: '28¢', yesPrice: '28¢', noPrice: '72¢' },
      { id: 'c6', text: 'Josh Shapiro', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c7', text: 'Any Other Candidate', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
    ]
  },
  {
    id: 'pub-2',
    title: 'Federal Reserve Interest Rate Decision (Sept 2026)',
    category: 'BUSINESS',
    volume: '$848,500',
    closingIn: '18d 12h',
    creator: 'FedWatchers',
    isPublic: true,
    contracts: [
      { id: 'c1', text: '50 bps Cut', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
      { id: 'c2', text: '25 bps Cut', prob: '68%', price: '68¢', yesPrice: '68¢', noPrice: '32¢' },
      { id: 'c3', text: 'No Change / Hold', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  },
  {
    id: 'pub-3',
    title: '2026 FIFA World Cup Winner',
    category: 'SPORTS',
    volume: '$1,890,100',
    closingIn: '11m 15d',
    creator: 'GlobalSports',
    isPublic: true,
    contracts: [
      { id: 'c8', text: 'Brazil', prob: '24%', price: '24¢', yesPrice: '24¢', noPrice: '76¢' },
      { id: 'c9', text: 'France', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
      { id: 'c10', text: 'England', prob: '16%', price: '16¢', yesPrice: '16¢', noPrice: '84¢' },
      { id: 'c11', text: 'Argentina', prob: '14%', price: '14¢', yesPrice: '14¢', noPrice: '86¢' },
    ]
  },
  {
    id: 'pub-4',
    title: 'Will OpenAI release GPT-5 before Dec 31, 2026?',
    category: 'TECH',
    volume: '$912,400',
    closingIn: '4m 6d',
    creator: 'TechOracle',
    isPublic: true,
    contracts: [
      { id: 'c12', text: 'Yes, full public release', prob: '74%', price: '74¢', yesPrice: '74¢', noPrice: '26¢' },
      { id: 'c13', text: 'No, delayed or renamed', prob: '26%', price: '26¢', yesPrice: '26¢', noPrice: '74¢' },
    ]
  },
  {
    id: 'pub-5',
    title: 'Grammy Album of the Year 2027',
    category: 'MUSIC',
    volume: '$315,800',
    closingIn: '6m 20d',
    creator: 'PopCultureHub',
    isPublic: true,
    contracts: [
      { id: 'c14', text: 'Billie Eilish', prob: '35%', price: '35¢', yesPrice: '35¢', noPrice: '65¢' },
      { id: 'c15', text: 'Taylor Swift', prob: '30%', price: '30¢', yesPrice: '30¢', noPrice: '70¢' },
      { id: 'c16', text: 'Kendrick Lamar', prob: '25%', price: '25¢', yesPrice: '25¢', noPrice: '75¢' },
      { id: 'c17', text: 'Field (Any Other Artist)', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  }
];

export function Explore() {
  const [events, setEvents] = useState<any[]>(PUBLIC_EVENTS);
  const [fetching, setFetching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create Modal state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [selectedModalCategory, setSelectedModalCategory] = useState('POLITICS');
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
        // Create in private group
        await createMarket(selectedGroupId, eventTitle, contracts);
        alert(`Private betting market listed in Group #${selectedGroupId}! Switch to Private Groups tab to view it.`);
      } else {
        // Create in public feed
        const newEvent = {
          id: `pub-${Math.random().toString(36).substr(2, 6)}`,
          title: eventTitle,
          category: selectedModalCategory,
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
    if (!confirm("Are you sure you want to delete this public market? Only the creator can do this.")) return;
    
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

  // Filter events by Category and Search Query
  const filteredEvents = events.filter(ev => {
    const matchesCat = activeCategory === 'ALL' || ev.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.contracts?.some((c: any) => c.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Polymarket Global Banner */}
      <div className="bg-gradient-to-r from-card via-card/90 to-primary/10 border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            Global Exchange Feed • 24/7 Liquidity
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Trade on the Future of Everything.
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Buy and sell share contracts on real-world outcomes across politics, sports, music, and AI. Want to bet with friends? Create an invite-only <Link to="/groups" className="text-primary font-bold hover:underline">Private Group</Link>!
          </p>
        </div>
        
        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/60">
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Exchange Volume</div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-success">$7,416,900</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/groups">
              <Button variant="outline" className="h-10 px-4 text-xs font-bold border-border bg-card hover:bg-muted/30 flex items-center gap-1.5 w-full sm:w-auto">
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

      {/* Real-Time Category Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/50">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'ALL' ? events.length : events.filter(e => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]' 
                  : 'bg-card text-muted-foreground border-border/60 hover:border-border hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : cat.color}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                isActive ? 'bg-black/20 text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search politics, 2028 election, World Cup, Federal Reserve rates..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card rounded-xl border-border text-sm font-medium shadow-2xs" 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 px-4 border-border font-semibold text-xs flex items-center gap-1.5 bg-card">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
        </div>
      </div>

      {/* Public Polymarket Feed */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No markets found in this category</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            There are no active global prediction series matching your search or category filter.
          </p>
          <Button onClick={() => setIsCreateEventOpen(true)} className="mt-2 text-xs font-bold bg-primary text-primary-foreground">
            List First Market
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => {
            const catMeta = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[1];
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
                      <span className="px-2.5 py-0.5 bg-muted/40 text-foreground rounded-md font-mono border border-border/60 flex items-center gap-1.5">
                        <CatIcon className={`w-3 h-3 ${catMeta.color}`} />
                        {catMeta.label}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary"><Clock className="w-3 h-3" /> {event.closingIn}</span>
                      <span>•</span>
                      <span className="font-mono text-foreground font-semibold">Vol {event.volume}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-mono"><ShieldCheck className="w-3 h-3" /> Public Market</span>
                    </div>
                    <Link to={`/bets/${event.id}`} className="block">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {event.title}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </h2>
                    </Link>
                  </div>

                  {/* Delete Button (Only visible if created by you) */}
                  {event.creator === 'You' && (
                    <button
                      onClick={(e) => handleDeleteEvent(e, event.id)}
                      disabled={deletingId === event.id}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-lg border border-transparent hover:border-destructive/30 hover:bg-destructive/10 transition-all text-xs font-semibold flex items-center gap-1 shrink-0"
                      title="Delete Series"
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>

                {/* Polymarket Multi-Contract List */}
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
                          {/* Contract Title & Probability Bar */}
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex justify-between items-center text-sm font-bold text-foreground mb-1.5">
                              <span className="truncate pr-2">{contract.text}</span>
                              <span className="font-mono text-primary font-extrabold">{contract.prob}</span>
                            </div>
                            {/* Kalshi Progress Bar */}
                            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.max(5, probNum))}%` }}
                              />
                            </div>
                          </div>

                          {/* Trading Action Buttons (Yes / No Pills) */}
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

                {/* View Full Series Footer */}
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

      {/* Create Market Modal (Supports Public or Private Group assignment!) */}
      <Dialog
        isOpen={isCreateEventOpen}
        onClose={() => !loading && setIsCreateEventOpen(false)}
        title="List Prediction Series"
        description="Launch a prediction market globally on the Public Exchange or privately in a friend group."
      >
        <form onSubmit={handleCreateEvent} className="space-y-5 pt-1">
          {/* Scope Selector: Public vs Private Group */}
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

          {/* If Private Group selected, choose which group! */}
          {marketScope === 'private' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Private Group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="1">🔒 The Boys (8 members)</option>
                <option value="2">🔒 Office Predictions (12 members)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Topic / Question</label>
            <Input 
              placeholder="e.g. US 2028 Election Winner, Next CEO, Office Sales Winner" 
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              required
              className="font-semibold h-11 text-sm"
            />
          </div>

          {/* Interactive Category Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => {
                const Icon = cat.icon;
                const isSel = selectedModalCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedModalCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                      isSel 
                        ? 'bg-primary/15 border-primary text-primary font-extrabold shadow-2xs' 
                        : 'bg-muted/10 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSel ? 'text-primary' : cat.color}`} />
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
