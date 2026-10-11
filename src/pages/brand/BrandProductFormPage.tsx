import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService, isValidUrl } from '../../services/brandOwnerService';
import { brandProductService, ExtendedProduct } from '../../services/brandProductService';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Plus, 
  X, 
  Tag, 
  DollarSign, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export const BrandProductFormPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = Boolean(productId);

  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [currency, setCurrency] = useState('₹');
  const [image, setImage] = useState('');
  const [externalPurchaseUrl, setExternalPurchaseUrl] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const brand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(brand);

    if (isEditMode && productId) {
      const existing = brandProductService.getProductById(productId);
      if (!existing) {
        setErrorMessage(`Product with ID "${productId}" was not found.`);
        setLoading(false);
        return;
      }

      // Check ownership
      if (brand && existing.brandId !== brand.id && currentUser.role !== 'admin') {
        setErrorMessage('Unauthorized: You do not have permission to edit this product.');
        setLoading(false);
        return;
      }

      setName(existing.name);
      setCategory(existing.category);
      setDescription(existing.description);
      setPrice(existing.price);
      setCurrency(existing.currency || '₹');
      setImage(existing.image);
      setExternalPurchaseUrl(existing.externalPurchaseUrl || '');
      setFeatures(existing.features ? [...existing.features] : []);
    } else if (brand) {
      // Default category from active brand
      setCategory(brand.category);
    }

    setLoading(false);
  }, [currentUser, productId, isEditMode]);

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed || features.includes(trimmed)) return;
    setFeatures([...features, trimmed]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeBrand) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (!name.trim() || name.trim().length < 2) {
        throw new Error('Product name must be at least 2 characters.');
      }
      if (!description.trim() || description.trim().length < 10) {
        throw new Error('Product description must be at least 10 characters.');
      }
      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid price (zero or positive).');
      }
      if (!image.trim() || !isValidUrl(image)) {
        throw new Error('Please enter a valid product image URL starting with http:// or https://');
      }
      if (externalPurchaseUrl.trim() && !isValidUrl(externalPurchaseUrl)) {
        throw new Error('External purchase URL must start with http:// or https://');
      }

      if (isEditMode && productId) {
        await brandProductService.updateProduct(currentUser, productId, {
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          image: image.trim(),
          externalPurchaseUrl: externalPurchaseUrl.trim() || undefined,
          features,
        });
      } else {
        await brandProductService.createProduct(currentUser, {
          brandId: activeBrand.id,
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          image: image.trim(),
          externalPurchaseUrl: externalPurchaseUrl.trim() || undefined,
          features,
        });
      }

      navigate('/brand/products');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/brand/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </Link>
        <span className="text-xs font-extrabold uppercase text-[#3F72AF]">
          {activeBrand?.name}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle">
        <div className="flex items-center gap-3 pb-6 border-b border-[#DBE2EF] mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#112D4E] tracking-tight">
              {isEditMode ? 'Edit Brand Product' : 'Add New Brand Product'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode
                ? `Update product details and specs for ${name || 'item'}.`
                : `Publish a new product for ${activeBrand?.name || 'your brand'} to enable creator briefs.`}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vintage Craft Cola (330ml Glass)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="Beverages">Beverages</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="Fashion & Streetwear">Fashion & Streetwear</option>
                <option value="Technology & Audio">Technology & Audio</option>
                <option value="Fitness & Activewear">Fitness & Activewear</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Travel & Luggage">Travel & Luggage</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Sustainable Lifestyle">Sustainable Lifestyle</option>
                <option value="Pet Care & Lifestyle">Pet Care & Lifestyle</option>
              </select>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-bold text-[#112D4E] focus:bg-white focus:outline-none"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Price <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key ingredients, materials, dimensions, or usage context..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Product Image URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              {image && isValidUrl(image) && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-[#DBE2EF]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#112D4E]">Image Live Preview</span>
                    <span className="text-[11px] text-gray-500 truncate max-w-sm">{image}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Webstore URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Official Webstore URL (Optional)
              </label>
              <input
                type="url"
                value={externalPurchaseUrl}
                onChange={(e) => setExternalPurchaseUrl(e.target.value)}
                placeholder="https://crimsonpop.demo.brandwaves.io/products/..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Features list */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Key Features & Highlights
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. 'Natural kola nut brew', 'Madagascar vanilla'..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-[#112D4E] text-white text-xs font-bold rounded-xl hover:bg-[#112D4E]/90 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#DBE2EF]/60 text-[#112D4E] text-xs font-bold flex items-center gap-2 border border-[#DBE2EF]"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
            <Link
              to="/brand/products"
              className="px-5 py-2.5 rounded-xl border border-[#DBE2EF] bg-white hover:bg-[#F9F7F7] text-xs font-bold text-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
