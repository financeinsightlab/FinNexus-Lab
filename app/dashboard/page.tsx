import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { getInsightBySlug, getResearchBySlug } from '@/lib/content';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

function initialsFrom(nameOrEmail: string | null | undefined) {
  const str = (nameOrEmail ?? '').trim();
  if (!str) return 'F';
  const parts: string[] = str.includes('@') ? [str.split('@')[0]] : str.split(/\s+/);
  const letters = parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .join('');
  return letters || 'F';
}

function roleLabel(role: string | undefined | null) {
  switch (role) {
    case 'FREE':
      return 'FREE';
    case 'PRO':
      return 'PRO';
    case 'ELITE':
      return 'ELITE';
    case 'TEAM':
      return 'TEAM';
    case 'ENTERPRISE':
      return 'ENTERPRISE';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return role ? String(role) : 'FREE';
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = session.user.id as string;
  const [saved, member] = await Promise.all([
    prisma.savedArticle.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    }),
  ]);

  const savedWithMeta = await Promise.all(
    saved.map(async (item) => {
      const slug = item.slug;
      const type = item.type as string;
      const url = type === 'insight' ? `/insights/${slug}` : `/research/${slug}`;

      const post =
        type === 'insight' ? await getInsightBySlug(slug) : await getResearchBySlug(slug);

      return {
        id: item.id,
        slug,
        type,
        savedAt: item.savedAt,
        url,
        title: post?.title ?? slug,
      };
    })
  );

  const displayName =
    session.user.name ?? session.user.email ?? 'FinNexus Member';

  const role = roleLabel(session.user.role as string | undefined);
  const subscriptionStatus = session.user.subscriptionStatus as string | undefined;

  const avatarInitials = initialsFrom(displayName);

  const planName =
    role === 'PRO' ? 'Pro' : role === 'ELITE' ? 'Elite' : role === 'TEAM' ? 'Team' : 'Free';

  const memberSince = member?.createdAt
    ? new Date(member.createdAt).toLocaleDateString('en-IN')
    : '';

  const benefits =
    role === 'PRO'
      ? ['Priority research access', 'Faster updates & briefs', 'Advanced filtering in search']
      : role === 'ELITE'
        ? ['Everything in Pro', 'Deep-dive market reports', 'Early access to premium insights']
        : [];

  return (
    <div>
      <header className="bg-brand-navy py-16">
        <div className="wrap">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold">
            Welcome back, {displayName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="tag tag-teal">{role}</span>
            <span className="text-white/80 text-sm">
              Status: {subscriptionStatus ?? 'INACTIVE'}
            </span>
          </div>

          {role === 'FREE' ? (
            <div className="mt-6">
              <Link href="/pricing" className="btn btn-primary inline-flex">
                Upgrade to Pro →
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <section className="wrap py-14 grid md:grid-cols-3 gap-8">
        {/* Card 1 — Account */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-brand-silver flex items-center justify-center text-brand-navy font-extrabold">
                {avatarInitials}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="font-extrabold text-brand-navy truncate">{displayName}</h2>
              <p className="text-sm text-brand-slate break-words">
                {session.user.email}
              </p>
              <p className="mt-2 text-sm text-brand-slate">
                Member since {memberSince || '—'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/dashboard/edit" className="btn btn-outline w-full">
              Edit Profile
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="btn btn-outline w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Card 2 — Subscription */}
        <div className="card p-6">
          <h2 className="font-extrabold text-brand-navy text-lg">Subscription</h2>
          <div className="mt-3">
            <div className="text-sm text-brand-slate">Current plan</div>
            <div className="font-extrabold text-brand-navy text-xl">{planName}</div>
            <div className="text-sm text-brand-slate mt-1">
              Status: {subscriptionStatus ?? 'INACTIVE'}
            </div>
          </div>

          <div className="mt-5">
            {role === 'FREE' ? (
              <div className="space-y-3">
                <p className="text-sm text-brand-slate">
                  Upgrade to unlock premium research and insights.
                </p>
                <Link href="/pricing" className="btn btn-primary w-full justify-center inline-flex">
                  Upgrade to Pro →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-brand-slate">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-teal" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6">
            <Link href="/pricing" className="btn btn-outline w-full justify-center inline-flex">
              Manage Billing
            </Link>
          </div>
        </div>

        {/* Card 3 — Saved Articles */}
        <div className="card p-6 md:col-span-1">
          <h2 className="font-extrabold text-brand-navy text-lg">Saved Articles</h2>

          <div className="mt-4">
            {savedWithMeta.length === 0 ? (
              <div className="text-center">
                <p className="text-sm text-brand-slate">
                  No saved articles yet. Start reading!
                </p>
                <Link
                  href="/research"
                  className="btn btn-primary mt-4 w-full justify-center inline-flex"
                >
                  Browse Research
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {savedWithMeta.map((item) => (
                  <li key={item.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={
                              item.type === 'insight' ? 'tag tag-navy' : 'tag tag-teal'
                            }
                          >
                            {item.type}
                          </span>
                        </div>
                        <div className="mt-2 font-semibold text-brand-navy line-clamp-2">
                          {item.title}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={item.url}
                        className="focus-ring inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-brand-navy hover:border-brand-teal hover:text-brand-teal"
                      >
                        Read →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

