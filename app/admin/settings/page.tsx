import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsClient from "./SettingsClient"

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  // Fetch all posts for the featured picker
  const allPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, type: true, excerpt: true, publishedAt: true },
  })

  // Fetch current featured selections
  const featuredResearch = await prisma.featuredContent.findMany({
    where: { section: "RESEARCH" },
    orderBy: { order: "asc" },
  })
  const featuredInsights = await prisma.featuredContent.findMany({
    where: { section: "INSIGHTS" },
    orderBy: { order: "asc" },
  })

  // Fetch hero stats
  const heroStats = await prisma.homePageItem.findMany({
    where: { section: "HERO_STATS" },
    orderBy: { order: "asc" },
  })

  // Fetch trackers
  const trackers = await prisma.homePageItem.findMany({
    where: { section: "TRACKERS" },
    orderBy: { order: "asc" },
  })

  // Fetch pillars
  const pillars = await prisma.homePageItem.findMany({
    where: { section: "PILLARS" },
    orderBy: { order: "asc" },
  })

  // Fetch section visibility configs
  const sectionConfigs = await prisma.homePageConfig.findMany({
    orderBy: { order: "asc" },
  })

  // Default hero stats if none in DB
  const defaultHeroStats = heroStats.length > 0 ? heroStats : [
    { id: "hs-0", section: "HERO_STATS", title: "10+", subtitle: "Reports", description: null, icon: null, link: null, color: null, order: 0, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "hs-1", section: "HERO_STATS", title: "₹1T+", subtitle: "Market Cap", description: null, icon: null, link: null, color: null, order: 1, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "hs-2", section: "HERO_STATS", title: "5+", subtitle: "Sectors", description: null, icon: null, link: null, color: null, order: 2, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "hs-3", section: "HERO_STATS", title: "Free", subtitle: "Always", description: null, icon: null, link: null, color: null, order: 3, enabled: true, updatedAt: new Date(), createdAt: new Date() },
  ]

  const defaultTrackers = trackers.length > 0 ? trackers : [
    { id: "tr-0", section: "TRACKERS", title: "Quick Commerce", subtitle: "GMV Growth: 42% YoY", description: null, icon: "🚀", link: "/tracker/quick-commerce", color: null, order: 0, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "tr-1", section: "TRACKERS", title: "Fintech", subtitle: "Digital Payments: ₹12.4T", description: null, icon: "💰", link: "/tracker/fintech", color: null, order: 1, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "tr-2", section: "TRACKERS", title: "EV", subtitle: "EV Adoption: 8.5%", description: null, icon: "⚡", link: "/tracker/ev", color: null, order: 2, enabled: true, updatedAt: new Date(), createdAt: new Date() },
    { id: "tr-3", section: "TRACKERS", title: "Food Delivery", subtitle: "Order Volume: 18M/month", description: null, icon: "🍔", link: "/tracker/food-delivery", color: null, order: 3, enabled: true, updatedAt: new Date(), createdAt: new Date() },
  ]

  return (
    <SettingsClient
      allPosts={allPosts.map(p => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      }))}
      featuredResearchIds={featuredResearch.map(f => f.contentId)}
      featuredInsightIds={featuredInsights.map(f => f.contentId)}
      heroStats={defaultHeroStats.map(s => ({ ...s, updatedAt: s.updatedAt.toISOString(), createdAt: s.createdAt.toISOString() }))}
      trackers={defaultTrackers.map(t => ({ ...t, updatedAt: t.updatedAt.toISOString(), createdAt: t.createdAt.toISOString() }))}
      pillars={pillars.map(p => ({ ...p, updatedAt: p.updatedAt.toISOString(), createdAt: p.createdAt.toISOString() }))}
      sectionConfigs={sectionConfigs.map(c => ({ id: c.id, section: c.section, enabled: c.enabled, order: c.order }))}
    />
  )
}
