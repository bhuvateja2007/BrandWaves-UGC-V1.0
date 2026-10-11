import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Flame,
  Star
} from 'lucide-react';
import { api } from '../api/client';
import { LeaderboardEntry } from '../types';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const Leaderboard: React.FC = () => {
  const [creators, setCreators] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setCreators(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load leaderboard', err);
        setError(err.message || 'Could not load community leaderboard');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const filteredCreators = creators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = creators.slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#DBE2EF]/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#3F72AF]" />
              Official Public Rankings
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs font-medium text-gray-500">Live Escrow & Quality Audited</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Creator Hall of Fame</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Recognizing top-tier BrandWaves content architects ranked by verified client approvals, rights-cleared delivery velocity, and community engagement score.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#DBE2EF] rounded-xl shadow-xs self-start md:self-auto">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg tab-transition btn-tactile cursor-pointer ${
              timeframe === 'all' 
                ? 'bg-[#112D4E] text-white shadow-xs' 
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg tab-transition btn-tactile cursor-pointer ${
              timeframe === 'month' 
                ? 'bg-[#112D4E] text-white shadow-xs' 
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg tab-transition btn-tactile cursor-pointer ${
              timeframe === 'week' 
                ? 'bg-[#112D4E] text-white shadow-xs' 
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            This Week
          </button>
        </div>
      </div>


      {/* Top 3 Podium Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-xs animate-pulse h-64">
              <div className="w-16 h-16 bg-[#DBE2EF] rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-[#DBE2EF] rounded w-2/3 mx-auto mb-2"></div>
              <div className="h-3 bg-[#DBE2EF] rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : topThree.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Rank 2 - Silver */}
          {topThree[1] && (
            <div className="relative bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center order-2 md:order-1 mt-0 md:mt-4 card-interactive">
              <div className="absolute -top-3 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                #2 Silver Tier
              </div>
              <div className="relative mt-2 mb-3">
                <img 
                  src={topThree[1].avatar} 
                  alt={topThree[1].name} 
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-200 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-extrabold border-2 border-white">
                  2
                </span>
              </div>
              <h3 className="font-bold text-[#112D4E] text-base">{topThree[1].name}</h3>
              <p className="text-xs text-gray-500 font-mono mb-3">{topThree[1].handle}</p>
              
              <div className="w-full bg-[#F9F7F7] rounded-xl p-3 border border-[#DBE2EF]/60 grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Approved</span>
                  <span className="font-bold text-[#112D4E]"><AnimatedCounter value={topThree[1].approvedCount} /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Rate</span>
                  <span className="font-bold text-emerald-600"><AnimatedCounter value={topThree[1].approvalRate} suffix="%" /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Earned</span>
                  <span className="font-bold text-[#3F72AF]"><AnimatedCounter value={topThree[1].totalEarnings} prefix="$" /></span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                Score: <AnimatedCounter value={topThree[1].score} /> pts
              </div>
            </div>
          )}

          {/* Rank 1 - Champion Gold */}
          {topThree[0] && (
            <div className="relative bg-gradient-to-b from-amber-50/40 via-white to-white rounded-2xl p-7 border-2 border-amber-300 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center order-1 md:order-2 card-interactive">
              <div className="absolute -top-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-white" />
                #1 Reigning Champion
              </div>
              <div className="relative mt-2 mb-3">
                <img 
                  src={topThree[0].avatar} 
                  alt={topThree[0].name} 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-sm font-extrabold border-2 border-white shadow-xs">
                  👑
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[#112D4E] text-lg">{topThree[0].name}</h3>
                <ShieldCheck className="w-4 h-4 text-[#3F72AF]" />
              </div>
              <p className="text-xs text-gray-500 font-mono mb-4">{topThree[0].handle}</p>
              
              <div className="w-full bg-[#F9F7F7] rounded-xl p-3.5 border border-amber-200/80 grid grid-cols-3 gap-2 text-center text-xs mb-4 shadow-2xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Approved</span>
                  <span className="font-extrabold text-base text-[#112D4E]"><AnimatedCounter value={topThree[0].approvedCount} /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Rate</span>
                  <span className="font-extrabold text-base text-emerald-600"><AnimatedCounter value={topThree[0].approvalRate} suffix="%" /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Earned</span>
                  <span className="font-extrabold text-base text-[#3F72AF]"><AnimatedCounter value={topThree[0].totalEarnings} prefix="$" /></span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Top Score: <AnimatedCounter value={topThree[0].score} /> pts
              </div>
            </div>
          )}

          {/* Rank 3 - Bronze */}
          {topThree[2] && (
            <div className="relative bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center order-3 mt-0 md:mt-6 card-interactive">
              <div className="absolute -top-3 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5 text-orange-600" />
                #3 Bronze Tier
              </div>
              <div className="relative mt-2 mb-3">
                <img 
                  src={topThree[2].avatar} 
                  alt={topThree[2].name} 
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-200 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-orange-200 text-orange-900 flex items-center justify-center text-xs font-extrabold border-2 border-white">
                  3
                </span>
              </div>
              <h3 className="font-bold text-[#112D4E] text-base">{topThree[2].name}</h3>
              <p className="text-xs text-gray-500 font-mono mb-3">{topThree[2].handle}</p>
              
              <div className="w-full bg-[#F9F7F7] rounded-xl p-3 border border-[#DBE2EF]/60 grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Approved</span>
                  <span className="font-bold text-[#112D4E]"><AnimatedCounter value={topThree[2].approvedCount} /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Rate</span>
                  <span className="font-bold text-emerald-600"><AnimatedCounter value={topThree[2].approvalRate} suffix="%" /></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Earned</span>
                  <span className="font-bold text-[#3F72AF]"><AnimatedCounter value={topThree[2].totalEarnings} prefix="$" /></span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-medium">
                <Flame className="w-3 h-3 text-orange-500" />
                Score: <AnimatedCounter value={topThree[2].score} /> pts
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-[#DBE2EF] shadow-xs overflow-hidden">
        {/* Search & Meta Bar */}
        <div className="p-4 sm:p-5 border-b border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F7F7]/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search creator name, handle or tier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#DBE2EF] rounded-xl text-xs sm:text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-[#112D4E]">{filteredCreators.length}</span> creators actively ranked
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DBE2EF] bg-[#F9F7F7] text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Creator</th>
                <th className="py-3.5 px-4">Tier Badge</th>
                <th className="py-3.5 px-4 text-center">Approved</th>
                <th className="py-3.5 px-4 text-center">Approval Rate</th>
                <th className="py-3.5 px-4 text-right">Total Earnings</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE2EF]/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading rankings...
                  </td>
                </tr>
              ) : filteredCreators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No creators found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredCreators.map((creator) => (
                  <tr 
                    key={creator.id}
                    className="hover:bg-[#F9F7F7]/80 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      {creator.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white font-extrabold text-xs shadow-xs">
                          1
                        </span>
                      ) : creator.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-gray-800 font-extrabold text-xs shadow-xs">
                          2
                        </span>
                      ) : creator.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-300 text-orange-950 font-extrabold text-xs shadow-xs">
                          3
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-gray-400 text-sm">
                          #{creator.rank}
                        </span>
                      )}
                    </td>

                    {/* Creator Identity */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="w-10 h-10 rounded-full object-cover border border-[#DBE2EF] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors flex items-center gap-1.5">
                            {creator.name}
                            {creator.rank <= 3 && <ShieldCheck className="w-3.5 h-3.5 text-[#3F72AF]" />}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{creator.handle}</div>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DBE2EF] text-[#112D4E]">
                        <Star className="w-3 h-3 text-[#3F72AF]" />
                        {creator.tier}
                      </span>
                    </td>

                    {/* Approved Count */}
                    <td className="py-4 px-4 text-center font-bold text-[#112D4E]">
                      {creator.approvedCount}
                    </td>

                    {/* Approval Rate */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-emerald-600 text-xs">
                          {creator.approvalRate}%
                        </span>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${creator.approvalRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Total Earnings */}
                    <td className="py-4 px-4 text-right font-bold text-[#3F72AF] font-mono">
                      ${creator.totalEarnings.toLocaleString()}
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 sm:px-6 text-right font-extrabold text-[#112D4E]">
                      {creator.score.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="bg-gradient-to-r from-[#112D4E] to-[#3F72AF] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Accelerate Your Creator Ranking
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Ready to climb the BrandWaves leaderboard?</h2>
          <p className="text-sm text-blue-100 mt-1 leading-relaxed">
            Submit verified deliverables for active brand briefs, pass enterprise editorial review, and unlock higher tier payouts and exclusive briefs.
          </p>
        </div>
        <Link 
          to="/campaigns"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#112D4E] font-bold text-sm shadow-md hover:bg-gray-50 transition-all shrink-0 hover:gap-3"
        >
          Explore Live Briefs
          <ArrowRight className="w-4 h-4 text-[#3F72AF]" />
        </Link>
      </div>
    </div>
  );
};
