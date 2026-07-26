import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Clock, Users, UserPlus, Plus, Search, Filter, Trash2, Loader2, ChevronRight, TrendingUp, Layers, Landmark, Trophy, Music, Briefcase, Cpu, Flame } from 'lucide-react';
import { fetchGroupMarkets, createMarket, deleteMarket } from '../lib/api';

// Standardized Real-Time Categories (Polymarket / Kalshi style)
const CATEGORIES = [
  { id: 'ALL', label: 'Trending', icon: Flame, color: 'text-orange-500' },
  { id: 'POLITICS', label: 'Politics', icon: Landmark, color: 'text-blue-500' },
  { id: 'SPORTS', label: 'Sports', icon: Trophy, color: 'text-amber-500' },
  { id: 'BUSINESS', label: 'Business & Economy', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'MUSIC', label: 'Music & Pop Culture', icon: Music, color: 'text-purple-500' },
  { id: 'TECH', label: 'Crypto & AI', icon: Cpu, color: 'text-cyan-500' },
];

// Rich Polymarket/Kalshi Initial Dataset across all categories
const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: 'Federal Reserve Interest Rate Decision (Sept 2026)',
    category: 'BUSINESS',
    volume: '$248,500',
    closingIn: '18d 12h',
    creator: 'Alex',
    contracts: [
      { id: 'c1', text: '50 bps Cut', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
      { id: 'c2', text: '25 bps Cut', prob: '68%', price: '68¢', yesPrice: '68¢', noPrice: '32¢' },
      { id: 'c3', text: 'No Change / Hold', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  },
  {
    id: 'e2',
    title: 'US 2028 Presidential Election Winner',
    category: 'POLITICS',
    volume: '$1,450,200',
    closingIn: '2y 4m',
    creator: 'You',
    contracts: [
      { id: 'c4', text: 'Gavin Newsom', prob: '32%', price: '32¢', yesPrice: '32¢', noPrice: '68¢' },
      { id: 'c5', text: 'JD Vance', prob: '28%', price: '28¢', yesPrice: '28¢', noPrice: '72¢' },
      { id: 'c6', text: 'Josh Shapiro', prob: '18%', price: '18¢', yesPrice: '18¢', noPrice: '82¢' },
      { id: 'c7', text: 'Any Other Candidate', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
    ]
  },
  {
    id: 'e3',
    title: '2026 FIFA World Cup Winner',
    category: 'SPORTS',
    volume: '$890,100',
    closingIn: '11m 15d',
    creator: 'Trader',
    contracts: [
      { id: 'c8', text: 'Brazil', prob: '24%', price: '24¢', yesPrice: '24¢', noPrice: '76¢' },
      { id: 'c9', text: 'France', prob: '22%', price: '22¢', yesPrice: '22¢', noPrice: '78¢' },
      { id: 'c10', text: 'England', prob: '16%', price: '16¢', yesPrice: '16¢', noPrice: '84¢' },
      { id: 'c11', text: 'Argentina', prob: '14%', price: '14¢', yesPrice: '14¢', noPrice: '86¢' },
    ]
  },
  {
    id: 'e4',
    title: 'Will OpenAI release GPT-5 before Dec 31, 2026?',
    category: 'TECH',
    volume: '$612,400',
    closingIn: '4m 6d',
    creator: 'Sarah',
    contracts: [
      { id: 'c12', text: 'Yes, full public release', prob: '74%', price: '74¢', yesPrice: '74¢', noPrice: '26¢' },
      { id: 'c13', text: 'No, delayed or renamed', prob: '26%', price: '26¢', yesPrice: '26¢', noPrice: '74¢' },
    ]
  },
  {
    id: 'e5',
    title: 'Grammy Album of the Year 2027',
    category: 'MUSIC',
    volume: '$115,800',
    closingIn: '6m 20d',
    creator: 'You',
    contracts: [
      { id: 'c14', text: 'Billie Eilish', prob: '35%', price: '35¢', yesPrice: '35¢', noPrice: '65¢' },
      { id: 'c15', text: 'Taylor Swift', prob: '30%', price: '30¢', yesPrice: '30¢', noPrice: '70¢' },
      { id: 'c16', text: 'Kendrick Lamar', prob: '25%', price: '25¢', yesPrice: '25¢', noPrice: '75¢' },
      { id: 'c17', text: 'Field (Any Other Artist)', prob: '10%', price: '10¢', yesPrice: '10¢', noPrice: '90¢' },
    ]
  }
];

export function GroupDetail() {
  const { id } = useParams();
  
  const [events, setEvents] = useState<any[]>(INITIAL_EVENTS);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create Modal state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [selectedModalCategory, setSelectedModalCategory] = useState('TECH');
  const [contracts, setContracts] = useState([{ text: 'Option A (Yes)' }, { text: 'Option B (No)' }]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupMarkets(id)
        .then(data => {
          if (data && data.length > 0) {
            const formatted = data.map((m: any) => ({
              id: m.id,
              title: m.question,
              category: m.category || 'TECH',
              volume: m.volume || '$1,000',
              closingIn: m.closingIn || '24h 0m',
              creator: m.creator || 'Trader',
              contracts: m.options?.map((opt: any, idx: number) => ({
                id: opt.id || `c-${idx}`,
                text: opt.text,
                prob: opt.prob || '50%',
                price: opt.price || '50¢',
                yesPrice: opt.price || '50¢',
                noPrice: `${100 - parseInt(opt.price || '50')}¢`
              })) || []
            }));
            setEvents(formatted);
          }
        })
        .catch(err => console.warn("Using Polymarket fallback events:", err))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://predictor.app/join/${id}`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || contracts.some(c => !c.text.trim()) || !id) return;
    
    setLoading(true);
    try {
      const res = await createMarket(id, eventTitle, contracts);
      const newEvent = {
        id: res.id,
        title: res.question,
        category: selectedModalCategory,
        volume: '$0',
        closingIn: '24h 0m',
        creator: 'You',
        contracts: res.options?.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          prob: opt.prob,
          price: opt.price,
          yesPrice: opt.price,
          noPrice: `${100 - parseInt(opt.price)}¢`
        })) || []
      };
      setEvents([newEvent, ...events]);
      setEventTitle('');
      setContracts([{ text: 'Option A' }, { text: 'Option B' }]);
      setIsCreateEventOpen(false);
    } catch (err) {
      console.error(err);
      const mockEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: eventTitle,
        category: selectedModalCategory,
        volume: '$0',
        closingIn: '24h 0m',
        creator: 'You',
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
      setEvents([mockEvent, ...events]);
      setIsCreateEventOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this prediction series? Only the creator can do this.")) return;
    
    setDeletingId(eventId);
    try {
      await deleteMarket(eventId);
      setEvents(events.filter(ev => ev.id !== eventId));
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Only the user who created')) {
        alert("Permission denied: You can only delete events that you created.");
      } else {
        setEvents(events.filter(ev => ev.id !== eventId));
      }
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
      {/* Exchange Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold tracking-wider uppercase mb-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            Group #{id} • Live Syndicate Feed
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            The Boys Exchange
            <span className="text-xs px-2.5 py-1 bg-success/10 text-success border border-success/30 rounded-full font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live Markets
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="text-right flex-1 sm:flex-none">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Balance</div>
            <div className="text-2xl font-mono font-bold text-success">$450.00</div>
          </div>
          <Button 
            variant="outline" 
            className="h-10 px-4 text-xs font-bold border-border hover:bg-muted/10"
            onClick={handleCopyInvite}
          >
            <UserPlus className="w-3.5 h-3.5 mr-2 text-primary" />
            {inviteCopied ? 'Copied Link!' : 'Invite Members'}
          </Button>
        </div>
      </div>

      {/* Polymarket / Kalshi Real-Time Category Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/50">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'ALL' ? events.length : events.filter(e => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all border ${
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search politics, crypto, sports tournaments, interest rates..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11 bg-card rounded-md border-border text-sm font-medium shadow-sm" 
          />
        </div>
        <div className="flex gap-2">
          <Button className="h-11 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center gap-2 shrink-0" onClick={() => setIsCreateEventOpen(true)}>
            <Layers className="w-4 h-4" />
            Create Multi-Market Event
          </Button>
        </div>
      </div>

      {/* Kalshi / Polymarket Event Feed */}
      {fetching ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
          <span className="font-mono">Loading prediction markets...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl p-8 space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No markets found in this category</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            There are no active prediction series matching your search or category filter. Be the first to list a market in this category!
          </p>
          <Button onClick={() => setIsCreateEventOpen(true)} className="mt-2 text-xs font-bold bg-primary text-primary-foreground">
            Create First Market
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
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all shadow-sm relative group overflow-hidden"
              >
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-border/60">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted/40 text-foreground rounded font-mono border border-border/60 flex items-center gap-1.5">
                        <CatIcon className={`w-3 h-3 ${catMeta.color}`} />
                        {catMeta.label}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary"><Clock className="w-3 h-3" /> {event.closingIn}</span>
                      <span>•</span>
                      <span className="font-mono text-foreground font-semibold">Vol {event.volume}</span>
                      <span>•</span>
                      <span>Created by {event.creator}</span>
                    </div>
                    <Link to={`/bets/${event.id}`} className="block">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {event.title}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </h2>
                    </Link>
                  </div>

                  {/* Delete Button (Only visible to Creator) */}
                  {(event.creator === 'You' || event.creator === 'Trader') && (
                    <button
                      onClick={(e) => handleDeleteEvent(e, event.id)}
                      disabled={deletingId === event.id}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg border border-transparent hover:border-destructive/30 hover:bg-destructive/10 transition-all text-xs font-semibold flex items-center gap-1 shrink-0"
                      title="Delete Series (Creator Only)"
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
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 flex justify-between">
                    <span>Prediction Outcomes ({event.contracts?.length || 0})</span>
                    <span className="hidden sm:inline">Live Order Book Prices</span>
                  </div>

                  <div className="grid gap-2">
                    {event.contracts?.map((contract: any, idx: number) => {
                      const probNum = parseInt(contract.prob || '50');
                      return (
                        <div 
                          key={contract.id || idx}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-background/60 border border-border/40 hover:border-border transition-colors gap-3"
                        >
                          {/* Contract Title & Probability Bar */}
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex justify-between items-center text-sm font-bold text-foreground mb-1.5">
                              <span className="truncate pr-2">{contract.text}</span>
                              <span className="font-mono text-primary font-extrabold">{contract.prob}</span>
                            </div>
                            {/* Kalshi Progress Bar */}
                            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
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
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-md bg-success/15 hover:bg-success/25 border border-success/30 text-success text-xs font-bold font-mono flex items-center justify-between gap-3 min-w-[90px] transition-all shadow-2xs"
                            >
                              <span>Yes</span>
                              <span className="text-sm font-extrabold">{contract.yesPrice || contract.price}</span>
                            </Link>
                            <Link 
                              to={`/bets/${event.id}?contract=${contract.id}&side=no`}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-md bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 text-destructive text-xs font-bold font-mono flex items-center justify-between gap-3 min-w-[90px] transition-all shadow-2xs"
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
                <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Multi-outcome prediction market • Consensus resolution</span>
                  <Link to={`/bets/${event.id}`} className="text-primary font-bold hover:underline flex items-center gap-1">
                    View full order book & charts <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Kalshi Multi-Market Modal */}
      <Dialog
        isOpen={isCreateEventOpen}
        onClose={() => !loading && setIsCreateEventOpen(false)}
        title="Create Real-Time Prediction Series"
        description="Launch an event topic with multiple outcomes across politics, sports, music, or tech."
      >
        <form onSubmit={handleCreateEvent} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Topic / Question</label>
            <Input 
              placeholder="e.g. US 2028 Election Winner, 2026 World Cup Champion" 
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
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {contracts.map((contract, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-muted/10 p-2 rounded border border-border/50">
                  <span className="font-mono text-xs font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                  <Input 
                    value={contract.text} 
                    onChange={(e) => {
                      const newC = [...contracts]; newC[idx].text = e.target.value; setContracts(newC);
                    }} 
                    placeholder={`Outcome name e.g. Candidate ${idx + 1}, Team ${idx + 1}`}
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
              List Market Series
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
