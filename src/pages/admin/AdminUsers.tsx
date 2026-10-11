import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { User } from '../../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  RefreshCw, 
  Star,
  Mail,
  UserX,
  UserCheck
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await api.getAdminUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended' | 'restricted') => {
    if (!confirm(`Are you sure you want to change this user's account status to ${status.toUpperCase()}?`)) return;
    setActionInProgress(userId);
    try {
      const updated = await api.updateUserStatus(userId, status);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#DBE2EF]/60 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Directory of registered platform users, roles, and compliance status.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Total Users: <strong className="text-[#112D4E]">{users.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search user by name, handle, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DBE2EF] text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#DBE2EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#DBE2EF] bg-[#F9F7F7] text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="py-3.5 px-6">User Identity</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Email Status</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-6 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DBE2EF]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading user directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No users found matching "{search}"</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-[#F9F7F7]/60 transition-colors">
                    {/* Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#DBE2EF] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#112D4E] flex items-center gap-1.5">
                            {user.name}
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#112D4E] text-white">ADMIN</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{user.handle}</div>
                          {user.email && <div className="text-[11px] text-gray-500">{user.email}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DBE2EF] text-[#112D4E] capitalize">
                        {user.role}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="py-4 px-4 text-gray-600 font-medium">
                      {user.tier || 'Rising Star'}
                    </td>

                    {/* Email Verification */}
                    <td className="py-4 px-4">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-4">
                      {user.accountStatus === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : user.accountStatus === 'restricted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Restricted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {user.role === 'admin' ? (
                        <span className="text-xs text-gray-400 italic">Protected Admin</span>
                      ) : user.accountStatus === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          disabled={actionInProgress === user.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Reinstate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          disabled={actionInProgress === user.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
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
    </div>
  );
};
