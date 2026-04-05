import { prisma } from '@/lib/prisma';
import { PredictionStatus } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PredictionWithAuthor = Awaited<ReturnType<typeof getAllPredictions>>[number];

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAllPredictions() {
  return prisma.prediction.findMany({
    orderBy: { resolveDate: 'asc' },
    include: {
      author: {
        select: { id: true, name: true, email: true, role: true, customBadge: true },
      },
    },
  });
}

export async function getPredictionsByAuthor(authorId: string) {
  return prisma.prediction.findMany({
    where: { authorId },
    orderBy: { resolveDate: 'desc' },
    include: {
      author: { select: { id: true, name: true, email: true, role: true, customBadge: true } },
    },
  });
}

export async function getOpenPredictions() {
  return prisma.prediction.findMany({
    where: { status: 'PENDING' },
    orderBy: { resolveDate: 'asc' },
    include: {
      author: { select: { id: true, name: true, email: true, role: true, customBadge: true } },
    },
  });
}

export async function getOverduePendingPredictions() {
  return prisma.prediction.findMany({
    where: {
      status: 'PENDING',
      resolveDate: { lt: new Date() },
    },
    orderBy: { resolveDate: 'asc' },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getPredictionBySlug(slug: string) {
  return prisma.prediction.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAnalystScore(authorId: string) {
  return prisma.analystScore.findUnique({
    where: { authorId },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAllAnalystScores() {
  return prisma.analystScore.findMany({
    orderBy: { calibrationScore: 'desc' },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

// ─── Calibration Score ────────────────────────────────────────────────────────

/**
 * Computes (confirmed + partial*0.5) / (confirmed + incorrect + partial) * 100
 * Also computes longest win streak and upserts the AnalystScore record.
 */
export async function calculateCalibrationScore(authorId: string): Promise<number> {
  const predictions = await getPredictionsByAuthor(authorId);

  const confirmed = predictions.filter((p) => p.status === 'CONFIRMED').length;
  const incorrect = predictions.filter((p) => p.status === 'INCORRECT').length;
  const partial   = predictions.filter((p) => p.status === 'PARTIAL').length;
  const total     = confirmed + incorrect + partial;

  const score = total === 0
    ? 0
    : ((confirmed + partial * 0.5) / total) * 100;

  // Compute longest win streak (resolved predictions sorted by date)
  const resolved = predictions
    .filter((p) => p.status !== 'PENDING')
    .sort((a, b) => new Date(a.resolveDate).getTime() - new Date(b.resolveDate).getTime());

  let longestStreak = 0;
  let currentStreak = 0;
  for (const p of resolved) {
    if (p.status === 'CONFIRMED') {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  await prisma.analystScore.upsert({
    where: { authorId },
    create: {
      authorId,
      totalPredictions: predictions.length,
      confirmed,
      incorrect,
      partial,
      calibrationScore: Math.round(score * 10) / 10,
      longestStreak,
      lastCalculated: new Date(),
    },
    update: {
      totalPredictions: predictions.length,
      confirmed,
      incorrect,
      partial,
      calibrationScore: Math.round(score * 10) / 10,
      longestStreak,
      lastCalculated: new Date(),
    },
  });

  return Math.round(score * 10) / 10;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createPrediction(data: {
  slug:        string;
  authorId:    string;
  claim:       string;
  sector:      string;
  resolveDate: Date;
  reportSlug?: string;
}) {
  return prisma.prediction.create({ data });
}

export async function resolvePrediction(
  id:     string,
  status: PredictionStatus,
  note?:  string,
) {
  await prisma.prediction.update({
    where: { id },
    data: { status, resolutionNote: note ?? null },
  });
  const prediction = await prisma.prediction.findUniqueOrThrow({ where: { id } });
  return calculateCalibrationScore(prediction.authorId);
}

export async function deletePrediction(id: string) {
  const prediction = await prisma.prediction.findUniqueOrThrow({ where: { id } });
  await prisma.prediction.delete({ where: { id } });
  return calculateCalibrationScore(prediction.authorId);
}

export async function updatePrediction(
  id: string,
  data: { claim: string; sector: string; resolveDate: Date; reportSlug?: string }
) {
  return prisma.prediction.update({
    where: { id },
    data,
  });
}
