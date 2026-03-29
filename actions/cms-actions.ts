"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ArticleType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type PostFormData = {
  title: string
  slug: string
  excerpt: string | null
  content: string
  type: ArticleType
  published: boolean
  featuredImage?: string | null
  
  // CMS Elite Meta
  seoTitle?: string | null
  metaDescription?: string | null
  focusKeywords?: string | null
  ogImage?: string | null
  ogTitle?: string | null
  tags?: string[]
  publishedAt?: Date | null
}

export async function createPost(formData: PostFormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const post = await prisma.post.create({
    data: {
      ...formData,
      authorId: session.user.id!,
      publishedAt: formData.published ? new Date() : null,
    },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${formData.type.toLowerCase()}`)
  return post
}

export async function updatePost(id: string, formData: PostFormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...formData,
      publishedAt: formData.published ? (formData.publishedAt || new Date()) : null,
    },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${formData.type.toLowerCase()}`)
  revalidatePath(`/${formData.type.toLowerCase()}/${formData.slug}`)
  return post
}

export async function deletePost(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const post = await prisma.post.delete({
    where: { id },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${post.type.toLowerCase()}`)
  return post
}
