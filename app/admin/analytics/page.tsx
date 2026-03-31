import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  FileText,
  Activity,
  ArrowUpRight,
  Download
} from "lucide-react"
import Link from "next/link"
import React from "react"
import AnalyticsCharts from "./AnalyticsCharts"

export default async function AdminAnalytics() {
  const session = await auth()

  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  // Fetch basic metrics for analytics
  const userCount = await prisma.user.count()
  let postCount = 0
  let totalPageViews = 0
  let topPages: Array<{ page: string; views: number; bounce: string; avgTime: string }> = []
  
  try {
    // Use type assertion to avoid 'any' - original pattern that was working
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postModel = (prisma as { post?: {
      count: () => Promise<number>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aggregate: (args: any) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findMany: (args: any) => Promise<any>;
    } }).post;
    
    if (postModel) {
      postCount = await postModel.count()
      
      // Get total page views (sum of viewCount)
      const result = await postModel.aggregate({
        _sum: {
          viewCount: true
        }
      })
      totalPageViews = result._sum.viewCount || 0
      
      // Get top 5 posts by viewCount
      const topPostData = await postModel.findMany({
        select: {
          slug: true,
          title: true,
          viewCount: true
        },
        where: {
          published: true
        },
        orderBy: {
          viewCount: 'desc'
        },
        take: 5
      })
      
      // Generate deterministic mock values based on slug hash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topPages = topPostData.map((post: any) => {
        // Simple hash from slug for deterministic values
        const hash = post.slug.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const bounce = 30 + (hash % 20); // 30-50%
        const avgMinutes = 1 + (hash % 5); // 1-5 minutes
        const avgSeconds = hash % 60; // 0-59 seconds
        
        return {
          page: `/${post.slug}`,
          views: post.viewCount,
          bounce: `${bounce}%`,
          avgTime: `${avgMinutes}m ${avgSeconds.toString().padStart(2, '0')}s`
        };
      })
    }
  } catch (e) {
    console.error("Error fetching post analytics:", e)
  }

  // Get user registrations by month for the last 4 months
  const now = new Date()
  const monthlyData = []
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  for (let i = 3; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    
    const userCountThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })
    
    // For pageviews, distribute total page views across months deterministically
    // Use month index to create a predictable distribution
    const monthIndex = month.getMonth() + 1; // 1-12
    const distributionFactor = 0.2 + (monthIndex % 4) * 0.1; // 0.2, 0.3, 0.4, 0.5 repeating
    const pageviewsThisMonth = Math.floor(totalPageViews * distributionFactor)
    
    monthlyData.push({
      month: monthNames[month.getMonth()],
      users: userCountThisMonth,
      pageviews: pageviewsThisMonth,
      sessions: Math.floor(pageviewsThisMonth * 0.6) // Mock sessions
    })
  }

  // Mock analytics data for metrics not stored in database
  const avgSessionDuration = "4m 32s"
  const bounceRate = "42%"
  const topCountry = "United States"
  const trafficSources = [
    { name: "Direct", value: 35, color: "#3b82f6" },
    { name: "Organic Search", value: 28, color: "#10b981" },
    { name: "Social Media", value: 22, color: "#8b5cf6" },
    { name: "Referral", value: 15, color: "#f97316" },
  ]

  const chartColors = {
    primary: "#0D6E6E",
    secondary: "#3b82f6",
    accent: "#10b981"
  }

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, color: "text-blue-400", change: "+12.4%" },
    { label: "Total Posts", value: postCount, icon: FileText, color: "text-emerald-400", change: "+8.2%" },
    { label: "Page Views", value: totalPageViews.toLocaleString(), icon: Eye, color: "text-purple-400", change: "+18.7%" },
    { label: "Avg. Session", value: avgSessionDuration, icon: Clock, color: "text-orange-400", change: "+2.3%" },
  ]

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="section-label">Analytics Hub</span>
          <h1 className="text-4xl font-extrabold text-white mt-2 leading-tight">Performance Intelligence</h1>
          <p className="text-slate-400 mt-2 max-w-xl">Real‑time insights into user engagement, traffic patterns, and content performance across FinNexus Lab.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 group whitespace-nowrap">
          <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1A1F2E] p-6 rounded-2xl border border-[#2D3748] hover:border-[#0D6E6E]/50 transition-all group shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-5">
              <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                {stat.change} <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1.5 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Analytics Dashboard - Client Component for Charts */}
      <AnalyticsCharts
        monthlyData={monthlyData}
        trafficSources={trafficSources}
        topPages={topPages}
        bounceRate={bounceRate}
        topCountry={topCountry}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/admin/cms" 
          className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 hover:border-[#0D6E6E]/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[#0D6E6E]/10 text-[#0D6E6E]">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#0D6E6E] transition-all" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Content Performance</h4>
          <p className="text-sm text-slate-400">Analyze engagement metrics for individual articles and reports.</p>
        </Link>

        <Link 
          href="/admin/users" 
          className="bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 hover:border-[#0D6E6E]/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-all" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">User Analytics</h4>
          <p className="text-sm text-slate-400">Track user acquisition, retention, and engagement patterns.</p>
        </Link>

        <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0B0D13] rounded-2xl border border-[#2D3748] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-semibold">Coming Soon</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Real‑time Monitoring</h4>
          <p className="text-sm text-slate-400">Live dashboard with WebSocket‑based real‑time analytics.</p>
        </div>
      </div>
    </div>
  )
}