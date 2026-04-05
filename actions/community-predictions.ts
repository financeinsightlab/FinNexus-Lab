"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function createCommunityPrediction(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Must be logged in to predict")

  const claim       = (formData.get('claim') as string)?.trim();
  const sector      = (formData.get('sector') as string)?.trim() || "General";
  
  // Default resolve date to 3 months from now if not provided
  let resolveDateStr = formData.get('resolveDate') as string
  let resolveDate = new Date()
  if (resolveDateStr) {
    resolveDate = new Date(resolveDateStr)
  } else {
    resolveDate.setMonth(resolveDate.getMonth() + 3)
  }

  if (!claim || claim.length < 5) return;

  const slug = `${slugify(claim).slice(0, 40)}-${Date.now()}`;

  await prisma.prediction.create({
    data: {
      slug,
      authorId: session.user.id!,
      claim,
      sector,
      resolveDate,
      status: "PENDING",
    }
  })

  revalidatePath('/predictions')
}
