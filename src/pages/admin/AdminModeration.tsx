import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Post, ModerationAction } from '../../types';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  FileText,
  Filter
} from 'lucide-react';

export const AdminModeration: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [auditLogs, setAuditLogs] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'moderated'>('all');
  const [search, setSearch] = useState('');

  // Unpublish Modal
  const [targetPost, setTargetPost] = useState<Post | null>(null);
  const [reason, setReason] = useState('Violation of BrandWaves Advertising Standards');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPosts, logs] = await Promise.all([
        api.getPosts({ status: 'all' }),
        api.getAdminAuditLogs().catch(() => []),
      ]);
      setPosts(allPosts);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load moderation queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnpublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPost) return;

    setSubmitting(true);
    try {
      const updated = await api.unpublishPost(targetPost.id, reason);
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setTargetPost(null);
      // Reload audit logs
      const logs = await api.getAdminAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Failed to unpublish post');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesFilter = filter === 'all' || p.publicationStatus === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#DBE2EF]/60 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
            Content Moderation & Policy Enforcement
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review live community posts, enforce rights compliance, and unpublish violating deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'published', 'moderated'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                filter === tab ? 'bg-[#112D4E] text-white' : 'bg-white text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Moderation Table */}
      <div className="bg-white rounded-3xl border border-[#DBE2EF] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DBE2EF] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts by title, creator, or niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
            />
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {filteredPosts.length} posts listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#DBE2EF] bg-[#F9F7F7] text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="py-3.5 px-6">Media & Title</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE2EF]/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Loading moderation records...</td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No posts found</td>
                </tr>
              ) : (
                filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-[#F9F7F7]/60 transition-colors">
                    {/* Media & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          className="w-14 h-10 rounded-lg object-cover bg-gray-900 shrink-0"
                        />
                        <div className="max-w-xs sm:max-w-md">
                          <h4 className="font-bold text-[#112D4E] line-clamp-1">{post.title}</h4>
                          <span className="text-[11px] text-gray-400 font-mono block">
                            ID: {post.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#112D4E]">{post.authorName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{post.authorHandle}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold text-[#3F72AF]">
                      {post.category}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {post.publicationStatus === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <ShieldAlert className="w-3 h-3" />
                          Moderated
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {post.publicationStatus === 'published' ? (
                        <button
                          onClick={() => setTargetPost(post)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                        >
                          Unpublish Post
                        </button>
                      ) : (
                        <span className="text-xs text-rose-600 font-semibold italic">Unpublished</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpublish Confirmation Modal */}
      {targetPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#112D4E]">Unpublish Community Content</h3>
              <p className="text-xs text-gray-500 mt-1">
                You are about to remove "{targetPost.title}" from the public community feed.
              </p>
            </div>

            <form onSubmit={handleUnpublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
                  Reason for Unpublishing *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] text-xs text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
                >
                  <option value="Violation of BrandWaves Advertising Standards">Violation of BrandWaves Advertising Standards</option>
                  <option value="Copyright or unlicensed commercial audio">Copyright or unlicensed commercial audio</option>
                  <option value="Misleading claim or unapproved brand sponsorship">Misleading claim or unapproved brand sponsorship</option>
                  <option value="Inappropriate graphic content or harassment">Inappropriate graphic content or harassment</option>
                  <option value="Expired brand sponsorship license">Expired brand sponsorship license</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetPost(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  {submitting ? 'Unpublishing...' : 'Confirm Unpublish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
