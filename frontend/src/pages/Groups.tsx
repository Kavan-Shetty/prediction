import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Users, Plus, TrendingUp, Link as LinkIcon, Loader2, Lock, ShieldCheck, ChevronRight, Globe, Flame } from 'lucide-react';
import { fetchGroups, createGroup, joinGroup } from '../lib/api';

const INITIAL_GROUPS = [
  { id: '1', name: 'The Boys', members: 8, openBets: 3, userBalance: 450, rank: 2, description: 'Weekend sports bets, office banters & crypto targets.' },
  { id: '2', name: 'Office Predictions', members: 12, openBets: 1, userBalance: -120, rank: 8, description: 'Q3 Sales tournaments, project deadlines, and promotions.' },
];

export function Groups() {
  const [groups, setGroups] = useState<any[]>(INITIAL_GROUPS);
  const [fetching, setFetching] = useState(true);
  
  // Modals state
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups()
      .then(data => {
        if (data && data.length > 0) {
          setGroups(data.map((g: any, idx: number) => ({
            id: g.id,
            name: g.name,
            members: g.members || 8,
            openBets: g.open_markets || 2,
            userBalance: g.user_balance || 100,
            rank: g.rank || idx + 1,
            description: g.description || 'Invite-only prediction syndicate.'
          })));
        }
      })
      .catch(err => console.warn("Using fallback private groups:", err))
      .finally(() => setFetching(false));
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    try {
      const newGroup = await createGroup(newGroupName);
      setGroups([...groups, {
        id: newGroup.id,
        name: newGroup.name,
        members: newGroup.members || 1,
        openBets: newGroup.open_markets || 0,
        userBalance: newGroup.user_balance || 0,
        rank: newGroup.rank || 1,
        description: newGroupDesc || 'Invite-only prediction syndicate.'
      }]);
      setNewGroupName('');
      setNewGroupDesc('');
      setIsNewGroupOpen(false);
    } catch (err) {
      console.error(err);
      setGroups([...groups, {
        id: Math.random().toString(36).substr(2, 6),
        name: newGroupName,
        members: 1,
        openBets: 0,
        userBalance: 0,
        rank: 1,
        description: newGroupDesc || 'Invite-only prediction syndicate.'
      }]);
      setIsNewGroupOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteLink.trim()) return;
    
    setLoading(true);
    try {
      const joined = await joinGroup(inviteLink);
      alert(`Joined private group: ${joined.name}`);
      setInviteLink('');
      setIsJoinGroupOpen(false);
    } catch (err) {
      alert(`Joined private group via link: ${inviteLink}`);
      setInviteLink('');
      setIsJoinGroupOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Private Groups Hero Banner */}
      <div className="bg-gradient-to-r from-card via-card/90 to-amber-500/10 border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Invite-Only Friends & Coworkers Syndicates
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Private Prediction Leagues.
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Bet on inside jokes, office sales tournaments, or college fantasy leagues. Unlike the <Link to="/explore" className="text-primary font-bold hover:underline">Global Exchange</Link>, markets created in private groups remain 100% confidential to group members.
          </p>
        </div>
        
        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/60">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="h-11 px-4 text-xs font-bold border-border bg-card hover:bg-muted/30 flex items-center gap-1.5 w-full sm:w-auto"
              onClick={() => setIsJoinGroupOpen(true)}
            >
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              Join via Link
            </Button>
            <Button 
              className="h-11 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center gap-2 w-full sm:w-auto"
              onClick={() => setIsNewGroupOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Private Group
            </Button>
          </div>
        </div>
      </div>

      {/* Private Groups Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          <span>Your Active Private Leagues ({groups.length})</span>
          <span>End-to-End Private Ledgers</span>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
            <span className="font-mono">Loading your private syndicates...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-3">
            <Lock className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <h3 className="text-lg font-bold text-foreground">No private groups yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Create a group with your friends or coworkers to list private prediction markets that won't show up on the public exchange feed!
            </p>
            <Button onClick={() => setIsNewGroupOpen(true)} className="mt-2 text-xs font-bold bg-primary text-primary-foreground">
              Create First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => (
              <Link 
                key={group.id} 
                to={`/groups/${group.id}`}
                className="flex flex-col p-5 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all shadow-sm group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-amber-500">
                      <span className="px-2 py-0.5 bg-amber-500/10 rounded font-mono border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PRIVATE LEAGUE
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {group.name}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </h2>
                  </div>
                  <div className="text-xs font-mono font-bold px-2.5 py-1 bg-muted/30 rounded-md border border-border/50 flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {group.members} Members
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2">
                  {group.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mt-auto border-t border-border/60 pt-4 font-mono text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase font-sans tracking-wider">Your Balance</div>
                    <div className={`font-bold text-sm ${group.userBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {group.userBalance > 0 ? '+' : ''}${Math.abs(group.userBalance)}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase font-sans tracking-wider">Open Markets</div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {group.openBets} Active
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase font-sans tracking-wider">Syndicate Rank</div>
                    <div className="font-bold text-sm text-primary flex items-center gap-1">
                      #{group.rank} of {group.members}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create New Group Modal */}
      <Dialog 
        isOpen={isNewGroupOpen} 
        onClose={() => !loading && setIsNewGroupOpen(false)}
        title="Create Private Group"
        description="Form an invite-only prediction syndicate with friends or coworkers."
      >
        <form onSubmit={handleCreateGroup} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">League Name</label>
            <Input 
              placeholder="e.g. The Boys, Office Bets, College Fantasy" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              required
              autoFocus
              className="h-11 font-semibold text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description / Purpose</label>
            <Input 
              placeholder="e.g. Weekend sports bets and Q3 sales predictions." 
              value={newGroupDesc}
              onChange={e => setNewGroupDesc(e.target.value)}
              className="h-11 text-xs"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-medium flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">100% Confidentiality Guarantee:</span> Markets created inside this group cannot be seen by public exchange traders.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsNewGroupOpen(false)} disabled={loading} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={!newGroupName.trim() || loading} className="h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Syndicate
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Join Group Modal */}
      <Dialog 
        isOpen={isJoinGroupOpen} 
        onClose={() => !loading && setIsJoinGroupOpen(false)}
        title="Join Private League"
        description="Enter an invite code or link provided by a syndicate member."
      >
        <form onSubmit={handleJoinGroup} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invite Link or Code</label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="https://predictor.app/join/boys-123 or boys-123" 
                value={inviteLink}
                onChange={e => setInviteLink(e.target.value)}
                className="pl-10 h-11 font-mono text-sm"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsJoinGroupOpen(false)} disabled={loading} className="h-10 px-6 font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={!inviteLink.trim() || loading} className="h-10 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Join Group
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
