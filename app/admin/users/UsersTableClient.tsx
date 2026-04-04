'use client';

import React, { useState } from 'react';
import { updateUserAccess, updatePurchasedServices, deleteUser } from './actions';
import { UserRole } from '@prisma/client';
import { Shield, Trash2, CheckCircle2, XCircle, ChevronDown, User as UserIcon } from 'lucide-react';

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  purchasedServices: string[];
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date | null;
  stripeCustomerId: string | null;
  isOnline: boolean;
  lastLogin: Date | null;
  _count: {
    accounts: number;
    sessions: number;
    savedArticles: number;
  };
};

export default function UsersTableClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const ROLES = ['MEMBER', 'VIEWER', 'ADMIN'] as const;
  const PLANS = ['FREE', 'PRO', 'ELITE', 'TEAM', 'PROFESSIONAL', 'ENTERPRISE', 'API_ONLY'];
  const STATUSES = ['ACTIVE', 'INACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED'];
  const SERVICES = [
    'Market Research Report',
    'Financial Modelling',
    'Competitive Intelligence',
    'Analytics Dashboard',
    'Strategy Note'
  ];

  const handleAccessChange = async (userId: string, field: string, value: string, currentUser: UserData) => {
    setLoadingId(userId);
    try {
      const newRole = field === 'role' ? value as UserRole : currentUser.role;
      const newPlan = field === 'plan' ? value : (currentUser.subscriptionPlan || 'FREE');
      const newStatus = field === 'status' ? value : currentUser.subscriptionStatus;

      await updateUserAccess(userId, newRole, newStatus, newPlan);
    } catch (e: any) {
      alert(e.message || 'Error updating user.');
    } finally {
      setLoadingId(null);
    }
  };

  const toggleService = async (userId: string, service: string, currentUser: UserData) => {
    setLoadingId(userId);
    try {
      const currentServices = currentUser.purchasedServices || [];
      let newServices;
      if (currentServices.includes(service)) {
        newServices = currentServices.filter(s => s !== service);
      } else {
        newServices = [...currentServices, service];
      }
      await updatePurchasedServices(userId, newServices);
    } catch (e: any) {
      alert(e.message || 'Error updating services.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to completely delete this user?')) return;
    setLoadingId(userId);
    try {
      await deleteUser(userId);
    } catch (e: any) {
      alert(e.message || 'Error deleting user.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5">
            <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Identity</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Access Role</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Subscription</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Procured Services</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {initialUsers.map((user) => (
            <tr key={user.id} className={`hover:bg-white/[0.02] transition-all group ${loadingId === user.id ? 'opacity-40 animate-pulse' : ''}`}>
              {/* Identity Column */}
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-[#0D6E6E]/10 border border-[#0D6E6E]/20 flex items-center justify-center text-[#0D6E6E] group-hover:bg-[#0D6E6E] group-hover:text-white transition-all shadow-inner">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1A1F2E] shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#0D6E6E] transition-colors">{user.name || "Anonymous User"}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">UID: {user.id.slice(0, 8)}</span>
                      {user.isOnline ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">● ONLINE</span>
                      ) : user.lastLogin ? (
                        <span className="text-[9px] text-slate-600">Last seen {new Date(user.lastLogin).toLocaleDateString()}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Role Column */}
              <td className="px-8 py-6">
                <div className="relative inline-block w-32 group/select">
                  <select
                    value={user.role}
                    onChange={(e) => handleAccessChange(user.id, 'role', e.target.value, user)}
                    className={`appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[#0D6E6E]/50 transition-all cursor-pointer
                      ${user.role === 'ADMIN' ? 'text-amber-400 border-amber-500/30' : 'text-slate-300'}
                    `}
                  >
                    {ROLES.map(r => <option key={r} value={r} className="bg-[#1A1F2E]">{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none group-hover/select:text-slate-400 transition-colors" />
                </div>
              </td>

              {/* Tier Column */}
              <td className="px-8 py-6">
                <div className="flex flex-col gap-2 w-40">
                  <div className="relative group/select">
                    <select
                      value={user.subscriptionPlan || 'FREE'}
                      onChange={(e) => handleAccessChange(user.id, 'plan', e.target.value, user)}
                      className="appearance-none w-full bg-white/5 border border-white/10 text-slate-300 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[#0D6E6E]/50 transition-all cursor-pointer"
                    >
                      {PLANS.map(p => <option key={p} value={p} className="bg-[#1A1F2E]">{p.replace('_', ' ')}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2 px-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${user.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {user.subscriptionStatus}
                    </span>
                  </div>
                </div>
              </td>

              {/* Services Column */}
              <td className="px-8 py-6">
                <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                  {SERVICES.map(service => {
                    const isActive = (user.purchasedServices || []).includes(service);
                    return (
                      <button
                        key={service}
                        onClick={() => toggleService(user.id, service, user)}
                        className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-tight ${
                          isActive 
                            ? 'bg-[#0D6E6E]/10 border-[#0D6E6E]/40 text-[#0D6E6E]' 
                            : 'bg-transparent border-white/5 text-slate-600 hover:border-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </td>

              {/* Status/Actions Column */}
              <td className="px-8 py-6 text-center">
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-3 text-slate-600 hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-2xl transition-all border border-transparent hover:border-red-400/20 shadow-sm"
                  title="Sever Identity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {initialUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center">
                 <div className="flex flex-col items-center justify-center space-y-3">
                   <XCircle className="w-12 h-12 text-slate-800" />
                   <p className="text-slate-500 font-medium">Zero identities match the current parameters.</p>
                 </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
