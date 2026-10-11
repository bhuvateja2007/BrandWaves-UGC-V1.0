import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Post } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const MyPosts: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');

  const loadPosts = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userPosts = await api.getPosts({ authorId: currentUser.id, status: 'all' });
      setPosts(userPosts);
    } catch (err) {
      console.error('Failed to load user posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this community post?')) return;
    setDeletingId(id);
    try {
      await api.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      const updated = await api.updatePost(editingPost.id, {
        title: editTitle,
        caption: editCaption,
      });
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingPost(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update post');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DBE2EF]/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#3F72AF]" />
              Creator Portfolio
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs text-gray-500 font-mono">{posts.length} deliverables</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">My Published Posts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your public community posts, monitor view metrics, and manage publication statuses.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Content</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl h-80 border border-[#DBE2EF] animate-pulse p-4" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DBE2EF] shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F9F7F7] text-[#3F72AF] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#112D4E]">No community posts yet</h3>
          <p className="text-xs text-gray-500">
            Publish your first product review or creative showcase to establish your BrandWaves creator portfolio.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3F72AF] text-white font-bold text-xs shadow-md"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#DBE2EF] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Media Container */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                      {post.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {post.publicationStatus === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Published Live
                      </span>
                    ) : post.publicationStatus === 'moderated' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold shadow-xs">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Unpublished by Mod
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-[#112D4E] text-sm leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  {post.caption && (
                    <p className="text-xs text-gray-500 line-clamp-2 italic">
                      "{post.caption}"
                    </p>
                  )}
                  {post.campaignTitle && (
                    <div className="text-[11px] font-semibold text-[#3F72AF] truncate">
                      Linked: {post.campaignTitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Actions Footer */}
              <div className="p-4 pt-3 border-t border-[#DBE2EF]/60 bg-[#F9F7F7]/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.viewsCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likesCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setEditTitle(post.title);
                      setEditCaption(post.caption || '');
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#112D4E] hover:bg-white transition-colors"
                    title="Edit Post"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-white transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="font-extrabold text-lg text-[#112D4E]">Edit Community Post</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1">
                  Caption
                </label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E]/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
