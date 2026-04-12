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
  
  // Enhanced Metadata
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | null
  targetAudience?: string[]
  contentStatus?: "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | null
  estimatedReadingTime?: number | null
  
  // Scheduling
  scheduledPublishAt?: Date | null
  
  // Visual Editor Blocks
  contentType?: 'MARKDOWN' | 'BLOCKS'
  blockContent?: any
}

export async function createPost(formData: PostFormData) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "ANALYST"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  let validAuthorId = session.user.id!;
  const existingUser = await prisma.user.findUnique({ where: { id: validAuthorId } });
  if (!existingUser) {
    console.warn("Cached session ID not found in database. Creating emergency dev user.");
    await prisma.user.create({
      data: {
        id: validAuthorId,
        email: `dev-${validAuthorId}@finnexus.com`,
        name: 'Admin Developer',
        role: 'ADMIN'
      }
    });
  }

  const post = await prisma.post.create({
    data: {
      ...formData,
      difficulty: formData.difficulty || "INTERMEDIATE",
      contentStatus: formData.contentStatus || "DRAFT",
      estimatedReadingTime: formData.estimatedReadingTime || 5,
      tags: formData.tags || [],
      targetAudience: formData.targetAudience || [],
      authorId: validAuthorId,
      publishedAt: formData.published ? new Date() : null,
      contentType: formData.contentType || "MARKDOWN",
      blockContent: formData.blockContent || null,
    },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${formData.type.toLowerCase()}`)
  return post
}

export async function updatePost(id: string, formData: PostFormData) {
  const session = await auth()
  const userRole = session?.user?.role as string
  if (!session?.user || !["ADMIN", "ANALYST"].includes(userRole)) {
    throw new Error("Unauthorized")
  }

  const existingPost = await prisma.post.findUnique({ where: { id } })
  if (!existingPost) throw new Error("Post not found")
  if (userRole === "ANALYST" && existingPost.authorId !== session.user.id) {
    throw new Error("You can only modify your own content.")
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...formData,
      difficulty: formData.difficulty || "INTERMEDIATE",
      contentStatus: formData.contentStatus || "DRAFT",
      estimatedReadingTime: formData.estimatedReadingTime || 5,
      tags: formData.tags || [],
      targetAudience: formData.targetAudience || [],
      publishedAt: formData.published ? (formData.publishedAt || new Date()) : null,
      contentType: formData.contentType || "MARKDOWN",
      blockContent: formData.blockContent || null,
    },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${formData.type.toLowerCase()}`)
  revalidatePath(`/${formData.type.toLowerCase()}/${formData.slug}`)
  return post
}

export async function deletePost(id: string) {
  const session = await auth()
  const userRole = session?.user?.role as string
  if (!session?.user || !["ADMIN", "ANALYST"].includes(userRole)) {
    throw new Error("Unauthorized")
  }

  const existingPost = await prisma.post.findUnique({ where: { id } })
  if (!existingPost) throw new Error("Post not found")
  if (userRole === "ANALYST" && existingPost.authorId !== session.user.id) {
    throw new Error("You can only modify your own content.")
  }

  const post = await prisma.post.delete({
    where: { id },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${post.type.toLowerCase()}`)
  return post
}

export async function togglePublishPost(id: string) {
  const session = await auth()
  const userRole = session?.user?.role as string
  if (!session?.user || !["ADMIN", "ANALYST"].includes(userRole)) {
    throw new Error("Unauthorized")
  }

  const post = await prisma.post.findUnique({
    where: { id },
  })

  if (!post) {
    throw new Error("Post not found")
  }
  if (userRole === "ANALYST" && post.authorId !== session.user.id) {
    throw new Error("You can only modify your own content.")
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      published: !post.published,
      publishedAt: !post.published ? new Date() : null,
    },
  })

  revalidatePath("/admin/cms")
  revalidatePath(`/${post.type.toLowerCase()}`)
  revalidatePath(`/${post.type.toLowerCase()}/${post.slug}`)
  return updatedPost
}

export async function togglePublishPostForm(formData: FormData) {
  const id = formData.get("id") as string
  await togglePublishPost(id)
}

export async function deletePostForm(formData: FormData) {
  const id = formData.get("id") as string
  await deletePost(id)
}
