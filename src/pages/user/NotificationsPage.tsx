import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Notification } from '../../types';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ShieldCheck 
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between border-b border-[#DBE2EF]/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Realtime updates on brand review decisions, escrow releases, and community activity.
          </p>
        </div>
        <div className="text-xs font-semibold text-[#3F72AF]">
          {notifications.filter(n => !n.read).length} unread
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-[#DBE2EF] animate-pulse h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DBE2EF] shadow-xs space-y-3">
          <Bell className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-base text-[#112D4E]">All caught up</h3>
          <p className="text-xs text-gray-500">You don't have any pending notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.read 
                  ? 'bg-white border-[#DBE2EF] opacity-80' 
                  : 'bg-white border-[#3F72AF]/40 shadow-xs ring-1 ring-[#3F72AF]/10'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'approval' 
                    ? 'bg-emerald-100 text-emerald-700'
                    : n.type === 'revision'
                    ? 'bg-amber-100 text-amber-700'
                    : n.type === 'submission'
                    ? 'bg-blue-100 text-[#3F72AF]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {n.type === 'approval' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : n.type === 'revision' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#112D4E]">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#3F72AF]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.actionUrl && (
                <Link
                  to={n.actionUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#F9F7F7] hover:bg-[#DBE2EF] text-[#112D4E] text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3 text-[#3F72AF]" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
