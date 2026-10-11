import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Report } from '../../types';
import { Flag, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Clock } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('Investigated deliverable and dismissed unverified flag.');

  const loadReports = async () => {
    try {
      setLoading(true);
      const list = await api.getAdminReports();
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const updated = await api.resolveReport(id, actionNotes);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      setResolvingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="border-b border-[#DBE2EF]/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
          Safety & Community Reports Queue
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review community reports regarding unlicensed media, copyright infringement, and policy non-compliance.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DBE2EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#DBE2EF] bg-[#F9F7F7] text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="py-3.5 px-6">Reported Entity</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Reason / Allegation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE2EF]/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Loading safety reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No safety reports logged</td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-[#F9F7F7]/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#112D4E]">
                      <span className="capitalize">{report.targetType}</span> ({report.targetId})
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {report.reporterName || report.reporterId}
                    </td>
                    <td className="py-4 px-4 max-w-xs text-gray-700 italic">
                      "{report.reason}"
                    </td>
                    <td className="py-4 px-4">
                      {report.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Pending Action
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {report.status === 'resolved' ? (
                        <span className="text-[11px] text-gray-400 italic">
                          Action: {report.actionTaken || 'Resolved'}
                        </span>
                      ) : (
                        <button
                          onClick={() => setResolvingId(report.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors"
                        >
                          Resolve Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-[#112D4E]">Resolve Safety Report</h3>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#DBE2EF] text-xs text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="flex-1 py-2 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolve(resolvingId)}
                className="flex-1 py-2 rounded-xl bg-[#112D4E] text-white text-xs font-bold"
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
