import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "./AdminLayoutClient"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/")

  return (
    <AdminLayoutClient
      userName={session.user.name || "Admin"}
      userRole={session.user.role}
      userInitial={session.user.name?.[0] || "A"}
    >
      {children}
    </AdminLayoutClient>
  )
}
