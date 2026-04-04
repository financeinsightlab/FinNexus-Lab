import AutonomousWorkforceCalc from '@/components/calculators/AutonomousWorkforceCalc';
import { auth } from '@/auth';

export default async function AutonomousWorkforcePage() {
  const session = await auth();
  const isPremiumUser = session?.user && ((session.user as any).role === 'ADMIN' || (session.user as any).subscriptionStatus === 'ACTIVE');

  return (
    <div className="pt-16 min-h-screen bg-[#0a0a0f]">
      <AutonomousWorkforceCalc slug="autonomous-workforce-simulator" isPremiumUser={!!isPremiumUser} />
    </div>
  );
}
