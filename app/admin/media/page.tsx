import MediaLibraryClient from './MediaLibraryClient'
import { auth } from '@/auth'

export default async function MediaLibraryPage() {
  const session = await auth()
  
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You must be logged in to access the media library.</p>
        </div>
      </div>
    )
  }

  return <MediaLibraryClient />
}