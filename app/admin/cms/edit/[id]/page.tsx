import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditClient from "./EditClient"
import React from "react"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  // Fetch the post
  let post = null
  try {
    const postModel = (prisma as any).post
    if (postModel) {
      post = await postModel.findUnique({
        where: { id },
        include: { author: { select: { name: true } } }
      })
    }
  } catch (e) {
    console.error("Failed to fetch post:", e)
  }

  if (!post) {
    redirect("/admin/cms")
  }

  return (
    <div className="-m-8 h-screen bg-[#0B1C2C]">
      <EditClient post={post} />
    </div>
  )
}