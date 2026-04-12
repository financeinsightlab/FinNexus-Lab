import type { Metadata } from 'next';
import { getAllPredictions } from '@/lib/predictions';
import { auth } from '@/auth';
import PredictionsClient from './PredictionsClient';

export const metadata: Metadata = {
  title: 'Predictions Board | FinNexus Lab',
  description:
    'Every prediction made by FinNexus Lab analysts — tracked, timestamped, and resolved publicly. Full accountability in financial intelligence.',
};

export const dynamic = 'force-dynamic';

export default async function PredictionsBoardPage() {
  const predictions = await getAllPredictions();

  // Unique sectors for filter pills
  const sectors = [...new Set(predictions.map((p) => p.sector))].sort();

  const stats = {
    total:     predictions.length,
    confirmed: predictions.filter((p) => p.status === 'CONFIRMED').length,
    incorrect: predictions.filter((p) => p.status === 'INCORRECT').length,
    pending:   predictions.filter((p) => p.status === 'PENDING').length,
    partial:   predictions.filter((p) => p.status === 'PARTIAL').length,
  };

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D13]">
      <PredictionsClient
        predictions={predictions}
        sectors={sectors}
        stats={stats}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
      />
    </div>
  );
}
