"use client"

import React from "react"
import { renderBlocks } from "@/lib/blocks/renderer"
import { Block } from "@/lib/blocks/registry"

interface ContentRendererProps {
  content: string
  contentType?: string
  blocks?: any
}

const ContentRenderer = ({ content, contentType, blocks }: ContentRendererProps) => {
  const isBlocks = contentType === "BLOCKS"
  
  let htmlResult = content
  
  if (isBlocks && blocks) {
    try {
      const blockArray = Array.isArray(blocks) ? blocks : (blocks.blocks || []) 
      htmlResult = renderBlocks(blockArray as Block[])
    } catch (e) {
      console.error("Failed to render blocks", e)
    }
  }

  return (
    <div 
      className={`prose prose-lg max-w-none dark:prose-invert
                 prose-h1:text-3xl prose-h1:font-extrabold prose-h1:text-gray-900 dark:prose-h1:text-white 
                 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 dark:prose-h2:text-white prose-h2:mt-12 
                 prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
                 prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:font-semibold hover:prose-a:text-teal-500 dark:hover:prose-a:text-teal-300
                 prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                 prose-li:text-gray-700 dark:prose-li:text-slate-300 prose-img:rounded-2xl prose-img:shadow-2xl
                 ${isBlocks ? 'block-editor-content' : ''}`}
      dangerouslySetInnerHTML={{ __html: htmlResult }}
    />
  )
}

export default ContentRenderer
