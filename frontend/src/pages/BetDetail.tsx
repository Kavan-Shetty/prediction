import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, ArrowLeft, Info, BarChart3, Loader2, CheckCircle2, Layers, Check, Landmark, Trophy, Music, Briefcase, Cpu, Flame } from 'lucide-react';
import { fetchMarketDetail, placeTrade } from '../lib/api';
import { cn } from '../lib/utils';

// Helper for formatting cents in JS
const formatCents = (val: number) => `${Math.round(val * 100)}¢`;
const formatProb = (val: number) => `${Math.round(val * 100)}%`;

const CATEGORY_MAP: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  POLITICS: { label: 'Politics', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
  SPORTS: { label: 'Sports', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  BUSINESS: { label: 'Business & Economy', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  MUSIC: { label: 'Music & Pop Culture', icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
  TECH: { label: 'Crypto & AI', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
};

// Default Kalshi event with multiple prediction contracts
const DEFAULT_KALSHI_EVENT = {
  id: 'e1',
  title: 'Federal Reserve Interest Rate Decision (Sept 2026)',
  category: 'BUSINESS',
  volume: '$248,500',
  closingIn: '18d 12h',
  creator: 'Alex',
  groupName: 'The Boys Exchange',
  groupId: '1',
  contracts: [
    { id: 'c1', text: '50 bps Cut', prob: '22%', price: '22¢', yesPrice: 0.22, noPrice: 0.78, yesShares: '1,450', noShares: '4,200', change: '+4%' },
    { id: 'c2', text: '25 bps Cut', prob: '68%', price: '68¢', yesPrice: 0.68, noPrice: 0.32, yesShares: '8,900', noShares: '2,100', change: '-2%' },
    { id: 'c3', text: 'No Change / Hold', prob: '10%', price: '10¢', yesPrice: 0.10, noPrice: 0.90, yesShares: '600', noShares: '6,400', change: '0%' }
  ]
};

export function BetDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [event, setEvent] = useState<any>(DEFAULT_KALSHI_EVENT);
  const [fetching, setFetching] = useState(true);
  
  // Selected contract within this Kalshi multi-market series
  const initialContractId = searchParams.get('contract') || DEFAULT_KALSHI_EVENT.contracts[0].id;
  const initialSide = (searchParams.get('side') as 'yes' | 'no') || 'yes';
  
  const [selectedContractId, setSelectedContractId] = useState<string>(initialContractId);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>(initialSide);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMarketDetail(id)
        .then(data => {
          if (data) {
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
              volume: data.volume || '$2,500',
              closingIn: data.closingIn || '24h 00m',
              creator: data.creator || 'Trader',
              groupName: data.groupName || 'The Boys Exchange',
              groupId: data.groupId || '1',
              contracts
            });
            if (!searchParams.get('contract') && contracts[0]) {
              setSelectedContractId(contracts[0].id);
            }
          }
        })
        .catch(err => console.warn("Using default Kalshi multi-contract event:", err))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const activeContract = event.contracts?.find((c: any) => c.id === selectedContractId) || event.contracts?.[0] || {};
  
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
      alert(err.message || "Failed to place trade");
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
      {/* Back Link */}
      <Link 
        to={`/groups/${event.groupId || '1'}`} 
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {event.groupName || 'Group Exchange'}
      </Link>

      {fetching ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
          <span className="font-mono">Loading multi-contract order book...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Series Overview & Multi-Contract Selector */}
          <div className="lg:col-span-2 space-y-6">
            {/* Series Header */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                <span className={`px-2.5 py-1 rounded font-mono border flex items-center gap-1.5 ${catInfo.bg} ${catInfo.color}`}>
                  <CatIcon className="w-3 h-3" />
                  {catInfo.label}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-foreground"><Clock className="w-3.5 h-3.5 text-primary" /> {event.closingIn}</span>
                <span>•</span>
                <span className="font-mono text-foreground font-semibold">Total Vol {event.volume}</span>
                <span>•</span>
                <span>Series by {event.creator}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">{event.title}</h1>
              <p className="text-xs text-muted-foreground font-medium">
                Select any outcome contract below to inspect its order book depth or place a trade. Multiple contracts can resolve simultaneously depending on consensus criteria.
              </p>
            </div>

            {/* Kalshi Multi-Contract Matrix Table */}
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                          <span>Vol: {contract.yesShares} shares</span>
                          <span>•</span>
                          <span className={contract.change?.startsWith('+') ? 'text-success' : 'text-destructive'}>
                            {contract.change} 24h
                          </span>
                        </div>
                      </div>

                      {/* Quick Contract Pill Buttons */}
                      <div className="flex gap-2 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleSelectContract(contract.id, 'yes')}
                          className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-md font-mono text-xs font-bold border transition-all flex items-center justify-between gap-3 min-w-[100px]",
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
                            "flex-1 sm:flex-none px-4 py-2 rounded-md font-mono text-xs font-bold border transition-all flex items-center justify-between gap-3 min-w-[100px]",
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

            {/* Selected Contract Order Book Depth */}
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                <span>Order Book Depth • "{activeContract.text}"</span>
                <span className="font-mono text-primary font-bold">{activeContract.prob} Implied Prob</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-6 text-sm font-mono">
                <div className="space-y-1">
                  <div className="text-success text-xs font-bold uppercase pb-1 border-b border-border flex justify-between">
                    <span>Yes Orders</span>
                    <span>Best: {yesCentsVal}¢</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-muted-foreground font-semibold"><span>Shares</span><span>Price</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>1,200</span><span>{yesCentsVal}¢</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>450</span><span>{Math.max(1, yesCentsVal - 1)}¢</span></div>
                  <div className="flex justify-between py-1 text-muted-foreground"><span>800</span><span>{Math.max(1, yesCentsVal - 2)}¢</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-destructive text-xs font-bold uppercase pb-1 border-b border-border flex justify-between">
                    <span>No Orders</span>
                    <span>Best: {noCentsVal}¢</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-muted-foreground font-semibold"><span>Price</span><span>Shares</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>{noCentsVal}¢</span><span>3,400</span></div>
                  <div className="flex justify-between py-1 border-b border-border/20"><span>{Math.max(1, noCentsVal - 1)}¢</span><span>120</span></div>
                  <div className="flex justify-between py-1 text-muted-foreground"><span>{Math.max(1, noCentsVal - 2)}¢</span><span>950</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Contract Trading Panel */}
          <div className="space-y-4">
            <div className="border border-border rounded-xl bg-card sticky top-20 shadow-lg overflow-hidden">
              <div className="p-3 bg-muted/20 border-b border-border text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Contract</div>
                <div className="text-base font-bold text-foreground truncate">{activeContract.text}</div>
              </div>

              {/* Yes / No Toggle Tab */}
              <div className="p-1.5 flex bg-muted/10 border-b border-border gap-1">
                <button
                  onClick={() => { setSelectedSide('yes'); setTradeSuccess(null); }}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-bold font-mono rounded transition-all flex items-center justify-center gap-2",
                    selectedSide === 'yes' ? "bg-success text-success-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>Buy Yes</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">{yesCentsVal}¢</span>
                </button>
                <button
                  onClick={() => { setSelectedSide('no'); setTradeSuccess(null); }}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-bold font-mono rounded transition-all flex items-center justify-center gap-2",
                    selectedSide === 'no' ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>Buy No</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">{noCentsVal}¢</span>
                </button>
              </div>

              <form onSubmit={handleTrade} className="p-5 space-y-4">
                {tradeSuccess && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
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
                  <div className="flex justify-between text-success pt-1 border-t border-border/30 font-bold text-sm">
                    <span>Max Potential Payout</span>
                    <span className="font-mono">${potentialReturn} ({amount ? `+${(((parseFloat(potentialReturn) - parseFloat(amount)) / parseFloat(amount)) * 100).toFixed(0)}%` : '+0%'})</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={!amount || loading || parseFloat(amount) <= 0}
                  className={cn(
                    "w-full h-12 text-base font-bold transition-all shadow-md",
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
