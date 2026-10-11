import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandProductService, ExtendedProduct } from '../../services/brandProductService';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const BrandProductsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const brand = brandOwnerService.getActiveBrand(currentUser);
      setActiveBrand(brand);
    }
  }, [currentUser]);

  const loadProducts = (brandId: string) => {
    const list = brandProductService.getProductsForBrand(brandId);
    setProducts(list);
  };

  useEffect(() => {
    if (activeBrand) {
      loadProducts(activeBrand.id);
    }
  }, [activeBrand]);

  const handleBrandChange = (brand: Brand) => {
    setActiveBrand(brand);
    loadProducts(brand.id);
  };

  const handleArchiveToggle = async (product: ExtendedProduct) => {
    if (!currentUser || !activeBrand) return;
    try {
      const updated = await brandProductService.archiveProduct(
        currentUser,
        product.id,
        !product.isArchived
      );
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSuccessMessage(
        updated.isArchived
          ? `Product "${product.name}" archived from public showcase.`
          : `Product "${product.name}" restored to public showcase.`
      );
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update product archival status');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDelete = async (product: ExtendedProduct) => {
    if (!currentUser || !activeBrand) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      return;
    }

    try {
      setErrorMessage(null);
      await brandProductService.deleteProduct(currentUser, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setSuccessMessage(`Product "${product.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete product.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'active' && p.isArchived) return false;
    if (statusFilter === 'archived' && !p.isArchived) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn">
      <BrandNavHeader
        activeBrand={activeBrand}
        onBrandChange={handleBrandChange}
        title="Product Catalog"
        subtitle="Manage the products your brand manufactures and makes available for creator UGC campaigns."
      />

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-[#DBE2EF] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-bold text-[#112D4E] focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F9F7F7] p-1 rounded-xl border border-[#DBE2EF]">
            {(['all', 'active', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#112D4E] text-white shadow-2xs'
                    : 'text-gray-500 hover:text-[#112D4E]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Add Product Button */}
        <Link
          to="/brand/products/new"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </section>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <section className="bg-white rounded-3xl p-12 text-center border border-[#DBE2EF] shadow-subtle flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#112D4E]">No Products Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No products matched your search or status filters. Try clearing filters.'
              : `You have not added any products for ${activeBrand?.name || 'this brand'} yet.`}
          </p>
          <Link
            to="/brand/products/new"
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Product</span>
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-white rounded-3xl p-5 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-4 card-interactive ${
                prod.isArchived ? 'opacity-70 bg-gray-50/70' : ''
              }`}
            >
              <div>
                {/* Media Preview & Badges */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#DBE2EF] mb-4 bg-[#F9F7F7]">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#112D4E]/80 backdrop-blur-sm text-white">
                      {prod.category}
                    </span>
                    {prod.isArchived && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-[#112D4E] shadow-xs">
                      {prod.priceFormatted || `${prod.currency}${prod.price}`}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-[#112D4E] line-clamp-1 mb-1">
                  {prod.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {prod.features && prod.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {prod.features.slice(0, 2).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF]"
                      >
                        {feat}
                      </span>
                    ))}
                    {prod.features.length > 2 && (
                      <span className="text-[10px] text-gray-400">
                        +{prod.features.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-between gap-2">
                <a
                  href={`/products/${prod.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[#F9F7F7] hover:bg-[#DBE2EF] text-gray-600 hover:text-[#112D4E] transition-colors"
                  title="View Public Marketplace Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/brand/products/${prod.id}/edit`}
                    className="px-3 py-1.5 rounded-xl bg-[#F9F7F7] hover:bg-[#DBE2EF] text-xs font-bold text-[#112D4E] flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#3F72AF]" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleArchiveToggle(prod)}
                    className="p-2 rounded-xl bg-[#F9F7F7] hover:bg-[#DBE2EF] text-gray-600 hover:text-[#112D4E] transition-colors cursor-pointer"
                    title={prod.isArchived ? 'Restore Product' : 'Archive Product'}
                  >
                    {prod.isArchived ? (
                      <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Archive className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(prod)}
                    className="p-2 rounded-xl bg-[#F9F7F7] hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Safely Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
