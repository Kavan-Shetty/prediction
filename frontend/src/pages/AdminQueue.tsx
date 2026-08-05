import { useState, useEffect } from 'react';
import { Newspaper, Bot, CheckCircle, XCircle, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BASE_URL } from '../lib/api';

interface PendingMarket {
  id: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  marketTitle: string;
  category: string;
  region: string;
  yesPrice: number;
  noPrice: number;
  resolvesAt: string;
  resolutionRules: string;
  createdAt: string;
}

export function AdminQueue() {
  const [markets, setMarkets] = useState<PendingMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PendingMarket>>({});

  useEffect(() => {
    fetchPendingMarkets();
  }, []);

  const fetchPendingMarkets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/admin/pending-markets`);
      if (res.ok) {
        const data = await res.json();
        setMarkets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const market = editingId === id ? { ...markets.find(m => m.id === id), ...editForm } : markets.find(m => m.id === id);
    if (!market) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/approve-market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: market.id,
          marketTitle: market.marketTitle,
          resolutionRules: market.resolutionRules,
          yesPrice: market.yesPrice,
          noPrice: market.noPrice
        })
      });

      if (res.ok) {
        setMarkets(markets.filter(m => m.id !== id));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/reject-market/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMarkets(markets.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-12 text-muted-foreground animate-pulse">Loading AI Drafts...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" /> Admin Curation Queue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review AI-drafted markets before pushing them live to the CLOB.</p>
        </div>
        <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Bot className="w-4 h-4" /> {markets.length} Pending Review
        </div>
      </div>

      {markets.length === 0 ? (
        <div className="text-center p-16 bg-card border border-border/80 rounded-2xl">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h2 className="text-lg font-bold">Queue is empty</h2>
          <p className="text-sm text-muted-foreground">The AI Scraper daemon hasn't found any new eligible news yet.</p>
          <Button variant="outline" className="mt-4" onClick={fetchPendingMarkets}>Refresh Queue</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {markets.map((market) => {
            const isEditing = editingId === market.id;
            return (
              <div key={market.id} className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                
                {/* Left Side: The Source News */}
                <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-border/50 bg-muted/10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border shadow-sm">
                    <Newspaper className="w-3.5 h-3.5" /> RSS Source
                  </div>
                  <h3 className="text-lg font-black leading-tight text-foreground">{market.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{market.summary}</p>
                  <a href={market.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline truncate block">
                    Verify Original Source ↗
                  </a>
                </div>

                {/* Right Side: The AI Drafted Market */}
                <div className="p-6 md:w-1/2 space-y-5 bg-gradient-to-br from-card to-primary/5">
                  <div className="flex justify-between items-center">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                      <Sparkles className="w-3.5 h-3.5" /> AI Drafted Contract
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Market Title</label>
                        <Input 
                          value={editForm.marketTitle ?? market.marketTitle} 
                          onChange={e => setEditForm({ ...editForm, marketTitle: e.target.value })}
                          className="font-bold text-sm h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Resolution Rules</label>
                        <textarea 
                          value={editForm.resolutionRules ?? market.resolutionRules}
                          onChange={e => setEditForm({ ...editForm, resolutionRules: e.target.value })}
                          className="w-full h-24 bg-background border border-border rounded-md p-3 text-xs font-mono text-muted-foreground focus:ring-1 focus:ring-primary outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1">
                           <label className="text-[10px] uppercase font-bold text-muted-foreground">Initial YES (¢)</label>
                           <Input 
                             type="number" step="0.01" 
                             value={editForm.yesPrice ?? market.yesPrice}
                             onChange={e => setEditForm({ ...editForm, yesPrice: parseFloat(e.target.value) })}
                             className="h-8 text-xs font-mono"
                           />
                         </div>
                         <div className="flex-1">
                           <label className="text-[10px] uppercase font-bold text-muted-foreground">Initial NO (¢)</label>
                           <Input 
                             type="number" step="0.01" 
                             value={editForm.noPrice ?? market.noPrice}
                             onChange={e => setEditForm({ ...editForm, noPrice: parseFloat(e.target.value) })}
                             className="h-8 text-xs font-mono"
                           />
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-foreground">{market.marketTitle}</h4>
                      
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Resolution Criteria
                        </div>
                        <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                          {market.resolutionRules}
                        </p>
                      </div>

                      <div className="flex justify-between items-center bg-background rounded-lg border border-border p-3 text-xs font-mono font-bold">
                        <span className="text-emerald-500">YES @ {Math.round(market.yesPrice * 100)}¢</span>
                        <span className="text-rose-500">NO @ {Math.round(market.noPrice * 100)}¢</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    {isEditing ? (
                       <>
                         <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="h-9">Cancel</Button>
                         <Button size="sm" onClick={() => handleApprove(market.id)} className="h-9 bg-success hover:bg-success/90 text-white font-bold gap-1.5">
                           <CheckCircle className="w-4 h-4" /> Save & Push Live
                         </Button>
                       </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(market.id)} className="h-9 font-semibold">
                          Edit Rules
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReject(market.id)} className="h-9 text-rose-500 border-rose-500/20 hover:bg-rose-500/10">
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(market.id)} className="h-9 bg-success hover:bg-success/90 text-white font-bold">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve & Push Live
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
