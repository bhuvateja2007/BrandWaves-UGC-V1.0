import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Campaign } from '../../types';
import { SuccessFeedback } from '../../components/common/SuccessFeedback';
import { 
  Upload, 
  FileVideo, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Play,
  Layers,
  HelpCircle
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB MVP limit
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export const UploadContent: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Audio');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successPostId, setSuccessPostId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'select' | 'details' | 'review'>('select');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const list = await api.getCampaigns({ status: 'active' });
        setCampaigns(list);
      } catch (err) {
        console.error('Failed to load campaigns for association', err);
      }
    }
    loadCampaigns();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);

    // 1. Validate MIME type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(`Unsupported file format (${selectedFile.type}). Please select an MP4, WebM, MOV video, or JPEG, PNG, WebP image.`);
      return;
    }

    // 2. Validate Size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds maximum size of 25 MB. Selected file: ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB.`);
      return;
    }

    setFile(selectedFile);
    const isVideo = selectedFile.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');

    // Create object URL for instant high-fidelity preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setActiveStep('details');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !previewUrl) {
      setError('Please select a media file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for your post.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setError(null);

    try {
      let finalMediaUrl = previewUrl;
      let storagePath: string | undefined;

      // Real Supabase Storage Upload (enforcing remote persistence)
      setUploadProgress(35);
      try {
        // Primary: Upload file bytes via verified backend endpoint using service-role credentials
        const uploadResult = await api.uploadMedia(file, currentUser?.id, false);
        finalMediaUrl = uploadResult.publicUrl;
        storagePath = uploadResult.storagePath;
        setUploadProgress(75);
      } catch (uploadApiErr: any) {
        // Direct Client Fallback: Attempt client-side Supabase Storage upload
        if (isSupabaseConfigured && currentUser) {
          const fileExt = file.name.split('.').pop();
          const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          storagePath = `user-${currentUser.id}/${safeName}`;

          const { error: uploadErr } = await supabase.storage
            .from('brandwaves-media')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadErr) {
            throw new Error(`Remote storage upload failed: ${uploadErr.message}`);
          }

          const { data: publicData } = supabase.storage
            .from('brandwaves-media')
            .getPublicUrl(storagePath);

          if (publicData?.publicUrl) {
            finalMediaUrl = publicData.publicUrl;
          }
          setUploadProgress(75);
        } else {
          // Truthful failure: Never masquerade a local blob as remote persistence in production
          throw new Error(`Media upload failed: ${uploadApiErr.message || 'Remote storage unavailable'}`);
        }
      }

      setUploadProgress(85);

      // Workflow A: Immediately publish community post in database!
      const post = await api.createPost({
        title,
        caption,
        category,
        mediaUrl: finalMediaUrl,
        mediaType,
        mediaStoragePath: storagePath,
        campaignId: selectedCampaignId || undefined,
      });

      setUploadProgress(100);
      setSuccessPostId(post.id);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to complete media upload and post publishing.');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setActiveStep('select');
    setError(null);
  };

  if (successPostId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
        <SuccessFeedback
          badgeText="Verified Deliverable Published"
          title="Content Published Successfully!"
          description={`"${title}" is now permanently recorded and showcased on the public BrandWaves Community Feed.`}
          actionButton={
            <button
              onClick={() => navigate('/feed')}
              className="px-6 py-3 rounded-xl bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 btn-tactile btn-glow"
            >
              <span>View in Community Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          }
          secondaryButton={
            <button
              onClick={() => navigate('/my-posts')}
              className="px-6 py-3 rounded-xl bg-white text-[#112D4E] border border-[#DBE2EF] font-bold text-xs sm:text-sm hover:bg-[#F9F7F7] shadow-xs transition-all btn-tactile"
            >
              Manage My Posts
            </button>
          }
        />
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#DBE2EF]/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            Workflow A: Instant Publishing
          </span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-xs text-gray-500 font-mono">Max 25 MB</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Upload & Publish Content</h1>
        <p className="text-sm text-gray-600 mt-1">
          Share your authentic perspective with the BrandWaves creator network. Uploaded deliverables are rights-cleared and published directly to the community feed.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Upload Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 3-Step Interactive Process Header */}
      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-[#DBE2EF] shadow-xs text-center text-xs">
        <button
          type="button"
          onClick={() => setActiveStep('select')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${
            activeStep === 'select' ? 'bg-[#112D4E] text-white shadow-xs' : 'text-gray-500 hover:text-[#112D4E]'
          }`}
        >
          1. Media Selection
        </button>
        <button
          type="button"
          onClick={() => file && setActiveStep('details')}
          disabled={!file}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${
            activeStep === 'details' ? 'bg-[#112D4E] text-white shadow-xs' : 'text-gray-500 hover:text-[#112D4E] disabled:opacity-40'
          }`}
        >
          2. Details & Brief
        </button>
        <button
          type="button"
          onClick={() => file && title && setActiveStep('review')}
          disabled={!file || !title}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${
            activeStep === 'review' ? 'bg-[#112D4E] text-white shadow-xs' : 'text-gray-500 hover:text-[#112D4E] disabled:opacity-40'
          }`}
        >
          3. Final Review & Publish
        </button>
      </div>

      {/* STEP 1: FILE DROP / SELECTION */}
      {activeStep === 'select' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#DBE2EF] hover:border-[#3F72AF] bg-white rounded-3xl p-10 sm:p-16 text-center transition-all cursor-pointer group shadow-xs hover:shadow-md"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-3xl bg-[#F9F7F7] group-hover:bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center mx-auto transition-colors mb-4 shadow-sm">
            <Upload className="w-8 h-8 transition-transform group-hover:-translate-y-1" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#112D4E]">
            Drag & drop your video or image here
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Supports MP4, WebM, MOV, JPEG, PNG, WebP up to 25 MB. Videos in 9:16 vertical ratio recommended for optimal feed engagement.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3F72AF] text-white font-bold text-xs sm:text-sm hover:bg-[#112D4E] transition-all shadow-md"
          >
            Browse Local Media
          </button>
        </div>
      )}

      {/* STEP 2 & 3: FORM DETAILS & REVIEW */}
      {(activeStep === 'details' || activeStep === 'review') && previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Media Preview Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-4 rounded-3xl border border-[#DBE2EF] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DBE2EF]/60 pb-3">
              <span className="text-xs font-bold text-[#112D4E] flex items-center gap-1.5 uppercase tracking-wider">
                {mediaType === 'video' ? <FileVideo className="w-4 h-4 text-[#3F72AF]" /> : <ImageIcon className="w-4 h-4 text-[#3F72AF]" />}
                Media Preview
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Replace
              </button>
            </div>

            <div className="relative aspect-[4/5] bg-gray-950 rounded-2xl overflow-hidden flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {file && (
              <div className="p-3 rounded-xl bg-[#F9F7F7] text-[11px] text-gray-500 space-y-1 font-mono">
                <div className="truncate"><strong>Name:</strong> {file.name}</div>
                <div><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                <div><strong>Type:</strong> {file.type}</div>
              </div>
            )}
          </div>

          {/* Form / Review Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-sm">
            {activeStep === 'details' ? (
              <form onSubmit={(e) => { e.preventDefault(); setActiveStep('review'); }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subway transit ANC acoustic stress test"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
                  >
                    <option value="Audio">Audio & Gear</option>
                    <option value="Fitness">Fitness & Movement</option>
                    <option value="Beauty">Beauty & Skincare</option>
                    <option value="Tech">Tech & Gadgets</option>
                    <option value="Home">Home & Spaces</option>
                    <option value="Lifestyle">Lifestyle & Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
                    Caption & Narrative
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your review observations, product testing notes, or creative takeaways..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
                    Optional Campaign Association
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
                  >
                    <option value="">None (Independent Community Showcase)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brandName} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="w-full py-3.5 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Continue to Final Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Review Step */
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Pre-Publication Audit Checklist
                  </span>
                  <h3 className="text-xl font-black text-[#112D4E]">Review Your Deliverable</h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Title:</span>
                    <span className="font-bold text-sm text-[#112D4E]">{title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Category:</span>
                    <span className="font-bold text-[#3F72AF]">{category}</span>
                  </div>
                  {caption && (
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Caption:</span>
                      <p className="text-gray-700 italic">"{caption}"</p>
                    </div>
                  )}
                  {selectedCampaignId && (
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Associated Campaign:</span>
                      <span className="font-semibold text-emerald-700">
                        {campaigns.find(c => c.id === selectedCampaignId)?.title || selectedCampaignId}
                      </span>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#112D4E]">
                      <span>Publishing to Supabase...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3F72AF] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('details')}
                    disabled={uploading}
                    className="flex-1 py-3.5 px-4 bg-white border border-[#DBE2EF] text-[#112D4E] font-bold text-xs sm:text-sm rounded-xl hover:bg-[#F9F7F7] transition-all"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 py-3.5 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Publish Live Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
