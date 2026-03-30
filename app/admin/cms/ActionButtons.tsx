"use client"

import { Clock, CheckCircle2, Trash2 } from "lucide-react"
import { togglePublishPostForm, deletePostForm } from "@/actions/cms-actions"
import { useTransition } from "react"

interface ActionButtonsProps {
  post: {
    id: string
    published: boolean
  }
}

export default function ActionButtons({ post }: ActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleTogglePublish = () => {
    if (!confirm(`Are you sure you want to ${post.published ? "unpublish" : "publish"} this post?`)) {
      return
    }
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", post.id)
      await togglePublishPostForm(formData)
    })
  }

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", post.id)
      await deletePostForm(formData)
    })
  }

  return (
    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        className="p-2 text-slate-500 hover:text-emerald-400 bg-white/5 hover:bg-emerald-400/10 rounded-xl transition-all disabled:opacity-50"
        title={post.published ? "Unpublish" : "Publish"}
      >
        {post.published ? (
          <Clock className="w-4 h-4" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-50"
        title="Remove Archive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}