import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  campaignApplicationService, 
  CampaignApplication, 
  ApplicationStorageStatus,
  ApplicationStatus 
} from '../../services/campaignApplicationService';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Compass, 
  Database, 
  Laptop, 
  ExternalLink,
  Trash2,
  Undo2
} from 'lucide-react';

const STATUS_TABS: Array<{ id: ApplicationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All Applications' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'accepted', label: 'Accepted / Active' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

export const CreatorApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const creatorId = currentUser?.id || 'user_alex';

  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [storageStatus, setStorageStatus] = useState<ApplicationStorageStatus>(
    campaignApplicationService.getStorageStatus()
  );

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await campaignApplicationService.getApplicationsForCreator(creatorId);
      setApplications(data);
      setStorageStatus(campaignApplicationService.getStorageStatus());
    } catch (err) {
      console.error('Failed loading creator applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();

    const handleUpdate = () => loadApplications();
    window.addEventListener('campaign_applications_updated', handleUpdate);
    return () => window.removeEventListener('campaign_applications_updated', handleUpdate);
  }, [creatorId]);

  const handleWithdraw = async (appId: string) => {
    try {
      await campaignApplicationService.withdrawApplication(creatorId, appId);
      setWithdrawingId(null);
      setMessage({ text: 'Application withdrawn successfully.', type: 'success' });
      loadApplications();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to withdraw application.', type: 'error' });
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;
    return true;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Collaboration Governance</span>
          </div>
          <h1 className="text-3xl font-black text-[#112D4E] tracking-tight">
            My Campaign Applications
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Track pitch reviews, acceptance confirmations, reviewer feedback, and withdraw pending submissions if necessary.
          </p>
        </div>

        <Link
          to="/creator/campaigns"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs btn-tactile self-start md:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Discover More Briefs</span>
        </Link>
      </section>

      {/* Storage Mode Notice */}
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
          {applications.length} applications on record
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

      {/* Filter Tabs */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? applications.length
              : applications.filter((a) => a.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#112D4E] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto space-y-4">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-black text-[#112D4E]">No Applications Found</h3>
          <p className="text-xs text-gray-500">
            {activeTab === 'all'
              ? 'You have not submitted any campaign pitches yet. Discover brand briefs and apply to start collaborating.'
              : `No applications with status "${activeTab}".`}
          </p>
          <Link
            to="/creator/campaigns"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Campaigns</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-[#DBE2EF] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                {/* Brand & Status Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  {app.brandLogo && (
                    <img
                      src={app.brandLogo}
                      alt={app.brandName}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#DBE2EF]"
                    />
                  )}
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {app.brandName}
                  </span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      app.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Submitted {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Campaign Title */}
                <div>
                  <Link
                    to={`/creator/campaigns/${app.campaignId}`}
                    className="text-base font-black text-[#112D4E] hover:text-[#3F72AF] transition-colors"
                  >
                    {app.campaignTitle}
                  </Link>
                </div>

                {/* Pitch & Proposed Deliverable */}
                <div className="bg-[#F9F7F7] p-4 rounded-2xl border border-[#DBE2EF]/60 space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-gray-500">Your Creative Pitch: </span>
                    <span className="text-gray-700">“{app.pitch}”</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500">Proposed Deliverable: </span>
                    <span className="text-[#112D4E] font-semibold">{app.proposedDeliverable}</span>
                  </div>

                  {app.reviewerNotes && (
                    <div className="pt-2 border-t border-[#DBE2EF]/60 text-xs text-gray-700">
                      <span className="font-bold text-[#3F72AF]">Brand Reviewer Feedback: </span>
                      <span className="italic">{app.reviewerNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Based on Status */}
              <div className="flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#DBE2EF]/60">
                {app.status === 'accepted' && (
                  <Link
                    to={`/submit?campaignId=${app.campaignId}`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Submit Deliverable</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {app.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => setWithdrawingId(app.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Withdraw Pitch</span>
                  </button>
                )}

                <Link
                  to={`/creator/campaigns/${app.campaignId}`}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-[#112D4E] inline-flex items-center gap-1"
                >
                  <span>View Brief</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl border border-[#DBE2EF]">
            <h3 className="text-base font-black text-[#112D4E]">Withdraw Application?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to withdraw this campaign application? The brand will no longer consider your pitch.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={() => handleWithdraw(withdrawingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <DemoNotice type="creator" />
    </div>
  );
};
