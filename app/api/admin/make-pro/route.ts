import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const formData = await req.formData()
  const userId = formData.get("userId") as string

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "PRO",
    },
  })

  redirect("/admin/users")
}