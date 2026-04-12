"use client"

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react"
import { Extension } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Typography } from "@tiptap/extension-typography"
import Suggestion from "@tiptap/suggestion"
import tippy, { Instance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Clock,
  Table as TableIcon,
  CheckSquare,
  Layout
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { CommandList, getSuggestionItems } from "./editor/extensions/SlashCommandItems"
import MediaLibraryModal from "./MediaLibraryModal"

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

// CUSTOM SLASH COMMAND EXTENSION FOR ELITE CMS
const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const Editor = ({ content, onChange }: EditorProps) => {
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside leading-relaxed space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside leading-relaxed space-y-2',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-[#0D6E6E] pl-6 py-2 italic font-serif text-slate-400 bg-white/2 my-6 rounded-r-xl',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-xl bg-black/50 p-6 font-mono text-sm border border-white/5 my-6 text-emerald-400',
          },
        },
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#0D6E6E] underline underline-offset-4 font-bold hover:text-[#0F9E9E] transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-white/10 shadow-2xl my-10 mx-auto block max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-8 bg-white/2 rounded-xl overflow-hidden',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-white/10 last:border-0',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-white/5 font-bold text-[#0D6E6E] text-xs uppercase tracking-widest p-4 text-left font-sans',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-4 text-sm text-slate-400 font-serif border-r border-white/10 last:border-0',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2 space-y-4 my-8',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-4',
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' to see your Elite widget library...",
      }),
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                })
              },

              onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },

              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide()
                  return true
                }
                return component.ref?.onKeyDown(props)
              },

              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      
      const text = editor.getText()
      const words = text.split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
      setReadingTime(Math.ceil(words.length / 200))
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[600px] font-serif leading-relaxed text-slate-300 px-4 md:px-12 py-12 selection:bg-[#0D6E6E]/30",
      },
    },
  })

  // Set initial stats
  useEffect(() => {
    if (editor) {
      const text = editor.getText()
      const words = text.split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
      setReadingTime(Math.ceil(words.length / 200))
    }
  }, [editor])

  if (!editor) return null

  const addImage = () => {
    setShowMediaLibrary(true)
  }

  const handleMediaSelect = (mediaUrl: string) => {
    editor.chain().focus().setImage({ src: mediaUrl }).run()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Methodology Link URL", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="w-full bg-[#1A1F2E]/30 border border-[#2D3748] rounded-[32px] overflow-hidden shadow-2xl flex flex-col anim-fade border-dashed hover:border-[#0D6E6E]/20 transition-all">
      {/* Visual Indicator: Slash Menu Hint */}
      <div className="bg-[#0D6E6E]/5 px-8 pt-6 pb-2">
         <p className="text-[10px] font-bold text-[#0D6E6E] uppercase tracking-widest flex items-center gap-2">
           <Layout className="w-3 h-3" /> Core Canvas Block
         </p>
      </div>

      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 bg-[#1A1F2E]/40 border-b border-[#2D3748]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("bold") ? "text-[#0D6E6E] bg-[#0D6E6E]/10 shadow-inner" : "text-slate-500 hover:text-white"}`}
            title="Bold"
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("italic") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-500 hover:text-white"}`}
            title="Italic"
          >
            <Italic className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("heading", { level: 1 }) ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-500 hover:text-white"}`}
            title="H1"
          >
            <Heading1 className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("bulletList") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-500 hover:text-white"}`}
            title="Bullets"
          >
            <List className="w-5 h-5" />
          </button>

          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-3 rounded-2xl transition-all text-slate-500 hover:text-teal-400 hover:bg-white/5"
            title="Insert Table"
          >
            <TableIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("taskList") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-500 hover:text-white"}`}
            title="Task List"
          >
            <CheckSquare className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={setLink}
            className={`p-3 rounded-2xl transition-all ${editor.isActive("link") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-500 hover:text-white"}`}
            title="Methodology Link"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={addImage}
            className="p-3 rounded-2xl transition-all text-slate-500 hover:text-white"
            title="Visual Media"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl">
            <Clock className="w-4 h-4 text-[#0D6E6E]" />
            <span className="text-[10px] font-bold text-slate-300 uppercase leading-none">{readingTime} MIN READ</span>
          </div>
          <div className="flex items-center gap-1.5 pr-2">
            <span className="text-[10px] font-bold text-[#0D6E6E] uppercase leading-none tracking-tighter">{wordCount} WORDS</span>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 bg-gradient-to-b from-[#0F1117] to-transparent">
        <EditorContent editor={editor} />
      </div>

      {/* Bubble Menu for quick formatting - temporarily disabled due to import issues */}
      {/* {editor && (
        <BubbleMenu editor={editor} options={{ offset: 12 }} className="flex bg-[#1A1F2E] border border-[#2D3748] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] anim-fade-up border-white/10 p-1 gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-3 rounded-xl transition-all ${editor.isActive("bold") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-3 rounded-xl transition-all ${editor.isActive("italic") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 my-auto mx-1" />
          <button
            onClick={setLink}
            className={`p-3 rounded-xl transition-all ${editor.isActive("link") ? "text-[#0D6E6E] bg-[#0D6E6E]/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )} */}

      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  )
}

export default Editor
