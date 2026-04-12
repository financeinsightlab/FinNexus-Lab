import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getOverduePendingPredictions, getAllPredictions, getAllAnalystScores } from '@/lib/predictions';
import { resolvePredictionAction, createPredictionAction, deletePredictionAction } from './actions';
import Link from 'next/link';
import HeroBackground from '@/components/ui/HeroBackground';

export const dynamic = 'force-dynamic';

function slugify(str: string) {
  return (str ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const SECTORS = [
  'Quick Commerce', 'Fintech', 'EV', 'Food Delivery',
  'SaaS', 'D2C', 'Healthcare', 'EdTech', 'General',
];

export default async function AdminPredictionsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (!["ADMIN", "ANALYST"].includes(session.user.role as string)) redirect('/');

  const [overdueRaw, allRaw, scores] = await Promise.all([
    getOverduePendingPredictions(),
    getAllPredictions(),
    getAllAnalystScores(),
  ]);

  const all = allRaw.filter((p) => p.author.role === "ADMIN" || p.author.role === "ANALYST");
  const overdue = overdueRaw.filter((p) => p.author.role === "ADMIN" || p.author.role === "ANALYST");

  const pending = all.filter((p) => p.status === 'PENDING').length;
  const confirmed = all.filter((p) => p.status === 'CONFIRMED').length;
  const incorrect = all.filter((p) => p.status === 'INCORRECT').length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-8 md:p-10 shadow-xl border border-white/5">
        <HeroBackground />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="section-label text-teal-400">Admin · Predictions Engine</span>
            <h1 className="text-4xl font-extrabold text-white mt-2">
              🎯 Prediction Resolution Centre
            </h1>
            <p className="text-slate-300 mt-2 max-w-xl">
              Resolve overdue predictions, track calibration scores, and create new predictions.
            </p>
          </div>
          <Link
            href="/predictions"
            className="btn-primary bg-white text-brand-navy hover:bg-gray-100 text-sm whitespace-nowrap shadow-lg"
          >
            View Public Board →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: all.length, color: 'text-white' },
          { label: 'Pending', value: pending, color: 'text-yellow-400' },
          { label: 'Confirmed', value: confirmed, color: 'text-green-400' },
          { label: 'Incorrect', value: incorrect, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1F2E] rounded-xl border border-[#2D3748] p-5 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Overdue Predictions ─── */}
      <section className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            ⏰ Overdue Predictions
            {overdue.length > 0 && (
              <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                {overdue.length} need resolution
              </span>
            )}
          </h2>
        </div>

        {overdue.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium">All overdue predictions have been resolved.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.map((p) => {
              const daysOverdue = Math.floor(
                (Date.now() - new Date(p.resolveDate).getTime()) / 86_400_000,
              );

              return (
                <div
                  key={p.id}
                  className="bg-[#0f1c2d] rounded-xl border border-red-900/30 p-5 space-y-4"
                >
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="tag tag-teal">{p.sector}</span>
                    <span className="text-slate-400">by {p.author.name}</span>
                    <span className="text-red-400 font-semibold ml-auto">
                      {daysOverdue}d overdue
                    </span>
                  </div>

                  {/* Claim */}
                  <p className="text-gray-900 dark:text-white italic text-base leading-relaxed">
                    &ldquo;{p.claim}&rdquo;
                  </p>

                  {/* Resolution form */}
                  <form action={resolvePredictionAction} className="space-y-3">
                    <input type="hidden" name="id" value={p.id} />

                    <div className="flex flex-wrap gap-2">
                      {(['CONFIRMED', 'INCORRECT', 'PARTIAL'] as const).map((s) => {
                        const colors = {
                          CONFIRMED: 'text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20',
                          INCORRECT: 'text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20',
                          PARTIAL:   'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
                        };
                        return (
                          <label
                            key={s}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${colors[s]}`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={s}
                              className="sr-only"
                              required
                            />
                            {s === 'CONFIRMED' ? '✅' : s === 'INCORRECT' ? '❌' : '🟡'} {s}
                          </label>
                        );
                      })}
                    </div>

                    <textarea
                      name="note"
                      placeholder="Resolution note — what actually happened? (optional)"
                      rows={2}
                      className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:border-[#0D6E6E] focus:outline-none resize-none"
                    />

                    <button
                      type="submit"
                      className="btn-primary text-sm"
                    >
                      Update &amp; Recalculate Score →
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Calibration Leaderboard ─── */}
      {scores.length > 0 && (
        <section className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            🏆 Calibration Leaderboard
          </h2>
          <div className="space-y-3">
            {scores.map((sc, i) => (
              <div key={sc.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <span className="text-slate-500 font-mono text-sm w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-semibold text-sm">{sc.author.name}</p>
                  <p className="text-slate-500 text-xs">{sc.totalPredictions} predictions · Streak: {sc.longestStreak}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-teal-400">
                    {sc.calibrationScore.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-500">calibration</p>
                </div>
                <Link
                  href={`/authors/${slugify(sc.author.name ?? '')}`}
                  className="text-[11px] text-[#0D6E6E] hover:underline ml-2 whitespace-nowrap"
                >
                  Profile →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Create Prediction ─── */}
      <section className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          ✏️ Create New Prediction
        </h2>
        <form action={createPredictionAction} className="space-y-4 max-w-2xl">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1.5">
              Prediction Claim *
            </label>
            <textarea
              name="claim"
              required
              rows={3}
              placeholder="e.g. Blinkit will achieve positive EBITDA by Q2 FY27"
              className="w-full bg-[#0f1c2d] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:border-[#0D6E6E] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1.5">
                Sector *
              </label>
              <select
                name="sector"
                required
                className="w-full bg-[#0f1c2d] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-[#0D6E6E] focus:outline-none"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1.5">
                Resolve Date *
              </label>
              <input
                type="date"
                name="resolveDate"
                required
                className="w-full bg-[#0f1c2d] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-[#0D6E6E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1.5">
              Source Report Slug (optional)
            </label>
            <input
              type="text"
              name="reportSlug"
              placeholder="e.g. blinkit-q3-fy26-deep-dive"
              className="w-full bg-[#0f1c2d] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:border-[#0D6E6E] focus:outline-none"
            />
          </div>

          <button type="submit" className="btn-primary">
            Publish Prediction →
          </button>
        </form>
      </section>

      {/* ─── Manage All Predictions ─── */}
      <section className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          ⚙️ Manage All Predictions
        </h2>
        
        {all.length === 0 ? (
          <p className="text-slate-500 text-sm">No predictions found.</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {all.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium text-sm line-clamp-2">&ldquo;{p.claim}&rdquo;</p>
                  <p className="text-xs text-slate-500 mt-1">Author: {p.author.name} &bull; Status: {p.status}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/predictions/${p.id}`} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                    Edit
                  </Link>
                  <form action={deletePredictionAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
