import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreatorPortfolioItem } from '../../types/marketplace';
import { creatorPortfolioService, PortfolioStorageStatus } from '../../services/creatorPortfolioService';
import { BRANDS, PRODUCTS, CAMPAIGNS, getBrandById, getProductById, getMarketplaceCampaignById } from '../../data/marketplaceData';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Database, 
  Laptop, 
  ArrowRight,
  Filter
} from 'lucide-react';

const FORMAT_OPTIONS: Array<CreatorPortfolioItem['format']> = [
  'Reel',
  'Short Video',
  'YouTube Video',
  'Photo Carousel',
  'Story',
];

export const CreatorPortfolioPage: React.FC = () => {
  const { currentUser } = useAuth();
  const creatorId = currentUser?.id || 'user_alex';

  const [items, setItems] = useState<CreatorPortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [storageStatus, setStorageStatus] = useState<PortfolioStorageStatus>(
    creatorPortfolioService.getStorageStatus()
  );

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CreatorPortfolioItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [format, setFormat] = useState<CreatorPortfolioItem['format']>('Reel');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [views, setViews] = useState<string>('15.4K');
  const [engagement, setEngagement] = useState<string>('5.1%');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [brandId, setBrandId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notice State
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await creatorPortfolioService.getPortfolioItems(creatorId);
      setItems(data);
      setStorageStatus(creatorPortfolioService.getStorageStatus());
    } catch (err) {
      console.error('Failed loading portfolio items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();

    const handleUpdate = () => loadPortfolio();
    window.addEventListener('creator_portfolio_updated', handleUpdate);
    return () => window.removeEventListener('creator_portfolio_updated', handleUpdate);
  }, [creatorId]);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setFormat('Reel');
    setThumbnail('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80');
    setViews('12.5K');
    setEngagement('4.8%');
    setDate(new Date().toISOString().split('T')[0]);
    setBrandId('');
    setProductId('');
    setCampaignId('');
    setModalOpen(true);
  };

  const openEditModal = (item: CreatorPortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setFormat(item.format);
    setThumbnail(item.thumbnail);
    setViews(item.views);
    setEngagement(item.engagement);
    setDate(item.date);
    setBrandId(item.relatedBrandId || '');
    setProductId(item.relatedProductId || '');
    setCampaignId(item.relatedCampaignId || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ text: 'Please provide a title for the portfolio item.', type: 'error' });
      return;
    }
    if (!thumbnail.trim()) {
      setMessage({ text: 'Please provide an image thumbnail URL.', type: 'error' });
      return;
    }

    try {
      if (editingItem) {
        await creatorPortfolioService.updatePortfolioItem(creatorId, editingItem.id, {
          title: title.trim(),
          format,
          thumbnail: thumbnail.trim(),
          views,
          engagement,
          date,
          relatedBrandId: brandId || undefined,
          relatedProductId: productId || undefined,
          relatedCampaignId: campaignId || undefined,
        });
        setMessage({ text: 'Portfolio item updated successfully!', type: 'success' });
      } else {
        await creatorPortfolioService.addPortfolioItem(creatorId, {
          title: title.trim(),
          format,
          thumbnail: thumbnail.trim(),
          views,
          engagement,
          date,
          relatedBrandId: brandId || undefined,
          relatedProductId: productId || undefined,
          relatedCampaignId: campaignId || undefined,
        });
        setMessage({ text: 'New portfolio item showcased successfully!', type: 'success' });
      }
      setModalOpen(false);
      loadPortfolio();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save portfolio item.', type: 'error' });
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await creatorPortfolioService.deletePortfolioItem(creatorId, itemId);
      setDeletingId(null);
      setMessage({ text: 'Portfolio item deleted.', type: 'success' });
      loadPortfolio();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete portfolio item.', type: 'error' });
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedFormat !== 'All' && item.format !== selectedFormat) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Showcase & Work Gallery</span>
          </div>
          <h1 className="text-3xl font-black text-[#112D4E] tracking-tight">
            Portfolio Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Curate your video reels, high-fidelity carousels, and product reviews to exhibit your visual storytelling prowess to brand partners.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs btn-tactile self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Portfolio Item</span>
        </button>
      </section>

      {/* Storage Status & Demo Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#DBE2EF] shadow-xs text-xs">
        <div className="flex items-center gap-2.5">
          {storageStatus.isPersistent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Supabase Cloud Synchronized</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
              <Laptop className="w-3 h-3 text-amber-600" />
              <span>Browser Storage (Local Fallback)</span>
            </span>
          )}
          <span className="text-gray-600">{storageStatus.message}</span>
        </div>

        <span className="text-[10px] text-gray-400 font-mono">
          {items.length} items cataloged
        </span>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Format Filter Tabs */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', ...FORMAT_OPTIONS].map((fmt) => (
          <button
            key={fmt}
            onClick={() => setSelectedFormat(fmt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFormat === fmt
                ? 'bg-[#112D4E] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
            }`}
          >
            {fmt}
          </button>
        ))}
      </section>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Loading portfolio pieces...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto space-y-4">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-black text-[#112D4E]">No Portfolio Items Found</h3>
          <p className="text-xs text-gray-500">
            {selectedFormat === 'All'
              ? 'You haven’t added any portfolio items yet. Add your first showcase piece to impress brands.'
              : `No items found in format "${selectedFormat}".`}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const linkedBrand = item.relatedBrandId ? getBrandById(item.relatedBrandId) : undefined;
            const linkedProduct = item.relatedProductId ? getProductById(item.relatedProductId) : undefined;
            const linkedCampaign = item.relatedCampaignId ? getMarketplaceCampaignById(item.relatedCampaignId) : undefined;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#DBE2EF] overflow-hidden shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                        {item.format}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-[#3F72AF] shadow-xs transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-black text-[#112D4E] line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Linked Entity Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {linkedBrand && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DBE2EF] text-[#112D4E]">
                          {linkedBrand.name}
                        </span>
                      )}
                      {linkedProduct && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {linkedProduct.name}
                        </span>
                      )}
                      {linkedCampaign && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {linkedCampaign.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="px-5 py-3.5 bg-[#F9F7F7] border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.views}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{item.engagement} eng.</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl border border-[#DBE2EF]">
            <h3 className="text-base font-black text-[#112D4E]">Delete Portfolio Item?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to remove this piece from your creator showcase? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-xl border border-[#DBE2EF] my-8">
            <div className="flex items-center justify-between border-b border-[#DBE2EF]/60 pb-3">
              <h2 className="text-lg font-black text-[#112D4E]">
                {editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Piece'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#112D4E] block mb-1">
                  Deliverable Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Velox Activewear — Urban Sprint Dynamic Reel"
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Content Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as CreatorPortfolioItem['format'])}
                    className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  >
                    {FORMAT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#112D4E] block mb-1">
                  Thumbnail / Cover Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Demo Views
                  </label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="e.g. 42.5K"
                    className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Demo Engagement
                  </label>
                  <input
                    type="text"
                    value={engagement}
                    onChange={(e) => setEngagement(e.target.value)}
                    placeholder="e.g. 6.2%"
                    className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Canonical Relationships */}
              <div className="pt-2 border-t border-[#DBE2EF]/60 space-y-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Canonical Marketplace Associations (Optional)
                </span>

                <div>
                  <label className="text-[11px] font-bold text-[#112D4E] block mb-1">
                    Related Brand
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E]"
                  >
                    <option value="">None (Independent Project)</option>
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#112D4E] block mb-1">
                    Related Product
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E]"
                  >
                    <option value="">None</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.currency}{p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#112D4E] block mb-1">
                    Related Campaign
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E]"
                  >
                    <option value="">None</option>
                    {CAMPAIGNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.brandName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DBE2EF]/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all"
                >
                  {editingItem ? 'Save Updates' : 'Add to Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
