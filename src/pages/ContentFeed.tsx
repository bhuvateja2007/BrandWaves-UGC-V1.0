import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Search, 
  ShieldCheck, 
  Filter, 
  Grid, 
  List, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  ExternalLink,
  Lock,
  Layers,
  Heart,
  Share2,
  X,
  Volume2
} from 'lucide-react';
import { api } from '../api/client';
import { Submission, Post } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

interface UGCFeedItem {
  id: string;
  title: string;
  campaignTitle: string;
  brandName: string;
  category: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  duration: string;
  videoUrl: string;
  thumbnail: string;
  caption: string;
  approvedDate: string;
  views?: string;
  rightsCleared: boolean;
}

const STATIC_SHOWCASES: UGCFeedItem[] = [
  {
    id: 'ugc-1',
    title: 'Subway transit ANC test & soundstage isolation',
    campaignTitle: 'AeroPulse Noise Canceling Wireless Launch',
    brandName: 'Lumino Audio',
    category: 'Audio',
    creatorName: 'Alex Rivera',
    creatorHandle: '@alexcreates',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    platform: 'TikTok',
    duration: '0:42',
    videoUrl: 'https://www.tiktok.com/@alexcreates/video/7348920192',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    caption: 'Testing the ANC on the Tokyo subway line. The low hum cutoff is instant. Studio-grade mids with no muddy bass.',
    approvedDate: '2 hours ago',
    views: '42.8K',
    rightsCleared: true,
  },
  {
    id: 'ugc-2',
    title: 'Morning Golden Hour Dewy Hydration Routine',
    campaignTitle: 'Ceramide Barrier Recovery Serum',
    brandName: 'Solstice Skincare',
    category: 'Skincare',
    creatorName: 'Sarah Mitchell',
    creatorHandle: '@sarahstyle',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    platform: 'Instagram',
    duration: '0:58',
    videoUrl: 'https://www.instagram.com/reel/C892189312',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    caption: 'Zero white cast, immediate skin plumping. Here is how I prep my barrier before 12 hours of studio lighting.',
    approvedDate: '5 hours ago',
    views: '88.3K',
    rightsCleared: true,
  },
  {
    id: 'ugc-3',
    title: 'Interval Sprint & Heel-Drop Cushioning Stress Test',
    campaignTitle: 'Stratus Pro Carbon-Plate Running Shoe',
    brandName: 'Velox Athletics',
    category: 'Fitness',
    creatorName: 'Marcus Vance',
    creatorHandle: '@marcusvance',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    platform: 'TikTok',
    duration: '0:35',
    videoUrl: 'https://www.tiktok.com/@marcusvance/video/7391823901',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    caption: 'Taking the Stratus Pro out on wet track turf. The carbon plate snap gives you effortless energy return on every transition.',
    approvedDate: '1 day ago',
    views: '115.4K',
    rightsCleared: true,
  },
  {
    id: 'ugc-4',
    title: 'Pour-Over Aeration & Precision Burr Grind Review',
    campaignTitle: 'Artisan Pour-Over Cold Brew System',
    brandName: 'Origin Roasters',
    category: 'Coffee & Spaces',
    creatorName: 'Elena Rostova',
    creatorHandle: '@elenacoffee',
    creatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    platform: 'YouTube',
    duration: '2:15',
    videoUrl: 'https://www.youtube.com/watch?v=origin-coffee-test',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    caption: 'Dialing in Ethiopian light roasts at 93°C. The flow rate control on this dripper avoids channel channeling completely.',
    approvedDate: '2 days ago',
    views: '24.1K',
    rightsCleared: true,
  },
  {
    id: 'ugc-5',
    title: '7-Day Ultra Endurance Ergonomic Grip Review',
    campaignTitle: 'Titan Hydro Flask 48hr Cold Insulation',
    brandName: 'Nordic Gear Co.',
    category: 'Fitness',
    creatorName: 'Alex Rivera',
    creatorHandle: '@alexcreates',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    platform: 'Instagram',
    duration: '0:45',
    videoUrl: 'https://www.instagram.com/reel/nordic-titan-test',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    caption: 'Still ice cold after a 6-hour alpine trek. Zero condensation on the powder coat.',
    approvedDate: '3 days ago',
    views: '67.2K',
    rightsCleared: true,
  },
  {
    id: 'ugc-6',
    title: 'Minimalist Desk Audio: Spatial Immersion for Coding',
    campaignTitle: 'Studio Reference Wireless Monitors',
    brandName: 'Lumino Audio',
    category: 'Audio',
    creatorName: 'Sarah Mitchell',
    creatorHandle: '@sarahstyle',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    platform: 'TikTok',
    duration: '0:50',
    videoUrl: 'https://www.tiktok.com/@sarahstyle/video/8192837190',
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    caption: 'Clean desk setup meets studio audio. The sound separation when switching between lofi and client calls is incredible.',
    approvedDate: '4 days ago',
    views: '93.0K',
    rightsCleared: true,
  }
];

export const ContentFeed: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalItem, setActiveModalItem] = useState<UGCFeedItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'dense'>('grid');
  const [dbSubmissions, setDbSubmissions] = useState<Submission[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [dbPosts, setDbPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [approved, postsList] = await Promise.all([
          api.getSubmissions({ status: 'approved' }).catch(() => []),
          api.getPosts().catch(() => []),
        ]);
        setDbSubmissions(approved);
        setDbPosts(postsList);
      } catch (e) {
        console.error('Could not fetch feed deliverables', e);
      }
    }
    loadData();

    // Supabase Realtime channel subscription for instant updates without page refresh
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime:community-feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          if (payload.new) {
            setDbPosts(prev => [payload.new as Post, ...prev]);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
          if (payload.new) {
            setDbPosts(prev => prev.map(p => p.id === (payload.new as Post).id ? (payload.new as Post) : p));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Merge live community posts, approved submissions, and static showcases
  const mergedItems: UGCFeedItem[] = [
    ...dbPosts.map(p => ({
      id: p.id,
      title: p.title,
      campaignTitle: p.campaignTitle || 'Community Showcase',
      brandName: p.brandName || 'BrandWaves Creator Network',
      category: p.category,
      creatorName: p.authorName,
      creatorHandle: p.authorHandle,
      creatorAvatar: p.authorAvatar,
      platform: 'TikTok' as const,
      duration: p.mediaType === 'video' ? '0:45' : 'Photo',
      videoUrl: p.mediaUrl,
      thumbnail: p.mediaUrl,
      caption: p.caption || 'Live published community post.',
      approvedDate: new Date(p.createdAt).toLocaleDateString(),
      views: `${(p.viewsCount || 1240).toLocaleString()}`,
      rightsCleared: true,
    })),
    ...dbSubmissions.map(s => ({
      id: s.id,
      title: s.videoTitle,
      campaignTitle: s.campaignTitle,
      brandName: s.brandName,
      category: 'Audio',
      creatorName: s.creatorName,
      creatorHandle: s.creatorHandle,
      creatorAvatar: s.creatorAvatar,
      platform: s.platform,
      duration: s.duration || '0:45',
      videoUrl: s.videoUrl,
      thumbnail: s.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      caption: s.caption || 'Verified approved campaign submission.',
      approvedDate: new Date(s.reviewedAt || s.createdAt).toLocaleDateString(),
      views: '12.4K',
      rightsCleared: true,
    })),
    ...STATIC_SHOWCASES
  ];

  const filteredItems = mergedItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header Block */}
      <section className="relative overflow-hidden pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3F72AF]" />
                Enterprise Certified Feed
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs font-mono text-gray-500">Public UGC Ledger</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Community Content Feed</h1>
            <p className="text-base text-gray-600 mt-2 leading-relaxed">
              Explore real, approved user-generated content created by the BrandWaves creator network. Every deliverable is rights-cleared, escrow-funded, and quality-audited.
            </p>
          </div>

          {/* Privacy & Ledger Callout */}
          <div className="flex items-center gap-3 bg-white border border-[#DBE2EF] px-4 py-3 rounded-2xl shadow-xs max-w-sm self-start md:self-auto">
            <div className="w-8 h-8 rounded-full bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] shrink-0">
              <Lock className="w-4 h-4 text-[#3F72AF]" />
            </div>
            <p className="text-xs text-gray-600 leading-snug">
              Only authorized public submissions are showcased here. Private reviews and embargoed briefs remain confidential.
            </p>
          </div>
        </div>

        {/* Live Pipeline Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#DBE2EF] shadow-subtle card-interactive">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Audited Deliverables</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#112D4E] tabular-nums">
                <AnimatedCounter value={4281} />
              </span>
              <span className="text-xs font-semibold text-emerald-600">100% Rights-Cleared</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Campaigns</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#112D4E] tabular-nums">
                <AnimatedCounter value={142} />
              </span>
              <span className="text-xs font-medium text-gray-500">Across 18 Niches</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Platform Integrity</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#112D4E] tabular-nums">Zero</span>
              <span className="text-xs font-medium text-gray-500">Vanity Metrics Policy</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Average Review Turnaround</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#112D4E] tabular-nums">
                <AnimatedCounter value={14.2} decimals={1} suffix="h" />
              </span>
              <span className="text-xs font-semibold text-[#3F72AF]">Live Escrow Sync</span>
            </div>
          </div>
        </div>

        {/* Filter & Curation Bar */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white border border-[#DBE2EF] shadow-xs mt-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Showcases' },
              { id: 'audio', label: 'Audio & Gear' },
              { id: 'skincare', label: 'Skincare & Rituals' },
              { id: 'fitness', label: 'Fitness & Movement' },
              { id: 'coffee', label: 'Coffee & Spaces' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap tab-transition cursor-pointer btn-tactile ${
                  selectedCategory === tab.id
                    ? 'bg-[#112D4E] text-white shadow-xs'
                    : 'bg-[#F9F7F7] text-gray-600 hover:text-[#112D4E] hover:bg-[#DBE2EF]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>


          {/* Search & Layout Toggles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search community posts, creators, or brand campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs sm:text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center bg-[#F9F7F7] p-1 rounded-xl border border-[#DBE2EF]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-[#112D4E] shadow-2xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('dense')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'dense' ? 'bg-white text-[#112D4E] shadow-2xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Compact View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UGC Cards Grid */}
      <section className="w-full">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#DBE2EF] shadow-xs">
            <p className="text-gray-500 font-medium">No UGC deliverables match your filter criteria.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 text-xs font-bold text-[#3F72AF] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
              : 'grid grid-cols-1 md:grid-cols-2 gap-4'
          }>
            {filteredItems.map((item) => {
              const isLiked = likedIds.has(item.id);
              return (
                <article
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="cursor-pointer flex flex-col bg-white rounded-2xl border border-[#DBE2EF] shadow-subtle card-interactive overflow-hidden group select-none"
                >
                  {/* Thumbnail & Video Banner (4:5 Aspect Ratio) */}
                  <div className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/25 pointer-events-none" />

                    {/* Platform & Duration Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                        {item.platform}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-mono">
                        {item.duration}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-700 text-[11px] font-bold shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    </div>

                    {/* Play Button Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md text-[#112D4E] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </div>
                    </div>

                    {/* Bottom Title & Campaign Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block mb-0.5">
                        {item.brandName}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow-sm line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content & Creator Row */}
                  <div className="p-4 flex flex-col justify-between gap-3 flex-1 bg-white">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      "{item.caption}"
                    </p>

                    <div className="pt-2 border-t border-[#DBE2EF]/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.creatorAvatar} 
                          alt={item.creatorName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#DBE2EF] shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#112D4E] truncate block">
                            {item.creatorName}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono truncate block">
                            {item.creatorHandle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className={`p-2 rounded-xl transition-all btn-tactile cursor-pointer ${
                            isLiked ? 'text-rose-500 bg-rose-50 ring-1 ring-rose-200' : 'text-gray-400 hover:text-gray-600 hover:bg-[#F9F7F7]'
                          }`}
                          title="Favorite Deliverable"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500 animate-icon-pop' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>

              );
            })}
          </div>
        )}
      </section>

      {/* Media Detail & Audit Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 animate-scaleUp">
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Preview Frame */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={activeModalItem.thumbnail} 
                alt={activeModalItem.title}
                className="w-full h-full object-cover opacity-80" 
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#3F72AF] text-white flex items-center justify-center shadow-xl mb-3">
                  <Play className="w-7 h-7 ml-1 fill-current" />
                </div>
                <h4 className="font-extrabold text-lg text-white max-w-md">{activeModalItem.title}</h4>
                <p className="text-xs text-blue-200 mt-1">Platform URL verified & rights-cleared</p>
                <a
                  href={activeModalItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all"
                >
                  Open Original on {activeModalItem.platform}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Modal Metadata Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={activeModalItem.creatorAvatar} 
                    alt={activeModalItem.creatorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#DBE2EF]"
                  />
                  <div>
                    <h3 className="font-bold text-[#112D4E] text-base">{activeModalItem.creatorName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{activeModalItem.creatorHandle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Passed Audit
                  </span>
                  <div className="text-[11px] text-gray-400 mt-0.5">{activeModalItem.approvedDate}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF]/60">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Deliverable Context & Brief
                </span>
                <p className="text-xs font-semibold text-[#112D4E]">
                  {activeModalItem.brandName} — {activeModalItem.campaignTitle}
                </p>
                <p className="text-xs text-gray-600 mt-1 italic">
                  "{activeModalItem.caption}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DBE2EF]/60 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-[#3F72AF]" />
                  <span>Licensed for commercial digital ads through BrandWaves Escrow</span>
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#112D4E] text-white font-bold text-xs hover:bg-[#112D4E]/90 transition-all"
                >
                  Done Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
