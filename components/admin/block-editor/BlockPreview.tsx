'use client'

import { Block } from '@/lib/blocks/registry'

interface BlockPreviewProps {
  block: Block
  isSelected: boolean
}

export default function BlockPreview({ block, isSelected }: BlockPreviewProps) {
  const { type, data } = block

  const wrapCls = `p-4 min-h-[48px] ${isSelected ? 'ring-1 ring-inset ring-[#0D6E6E]/30' : ''}`

  switch (type) {
    case 'heading': {
      const Tag = `h${data.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4'
      const sizes: Record<number, string> = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' }
      return (
        <div className={wrapCls}>
          <Tag className={`${sizes[data.level || 2]} font-extrabold text-white leading-tight`}>
            {data.text || <span className="text-slate-600">Heading text...</span>}
          </Tag>
        </div>
      )
    }
    case 'paragraph':
      return (
        <div className={`${wrapCls} prose prose-invert max-w-none prose-sm`}
          dangerouslySetInnerHTML={{ __html: data.html || '<p class="text-slate-500">Start writing...</p>' }}
        />
      )
    case 'image':
      return (
        <div className={wrapCls}>
          {data.src ? (
            <div className={`flex ${data.alignment === 'center' ? 'justify-center' : data.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.src}
                alt={data.alt || ''}
                className={`rounded-xl border border-white/10 shadow-lg ${data.alignment === 'full' ? 'w-full' : 'max-h-64 object-contain'}`}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#2D3748] rounded-xl p-8 text-center text-slate-600 text-sm">
              🖼️ Click settings to set image URL or pick from Media Library
            </div>
          )}
          {data.caption && <p className="text-center text-xs text-slate-500 mt-2 italic">{data.caption}</p>}
        </div>
      )
    case 'quote':
      return (
        <div className={wrapCls}>
          <blockquote className="border-l-4 border-[#0D6E6E] pl-5 py-2 italic text-slate-300">
            <p>{data.quote || <span className="text-slate-600">Quote text...</span>}</p>
            {data.attribution && <cite className="block mt-2 text-xs text-[#0D6E6E] not-italic font-bold">— {data.attribution}</cite>}
          </blockquote>
        </div>
      )
    case 'divider':
      return (
        <div className={wrapCls}>
          <hr className="border-none h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )
    case 'columns': {
      const cols = data.columns || []
      return (
        <div className={`${wrapCls} grid gap-4`} style={{ gridTemplateColumns: `repeat(${data.columnCount || 2}, 1fr)` }}>
          {cols.map((_, i) => (
            <div key={i} className="min-h-[60px] bg-white/3 border border-dashed border-[#2D3748] rounded-xl p-3 text-center text-xs text-slate-600">
              Column {i + 1}
            </div>
          ))}
        </div>
      )
    }
    case 'callout': {
      const variantStyles: Record<string, string> = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        danger: 'bg-red-500/10 border-red-500/30 text-red-300',
      }
      const cls = variantStyles[data.variant || 'info']
      return (
        <div className={`${wrapCls}`}>
          <div className={`border rounded-2xl p-4 ${cls} flex items-start gap-3`}>
            {data.icon && <span className="text-xl shrink-0">{data.icon}</span>}
            <div>
              {data.title && <p className="font-bold text-sm mb-1">{data.title}</p>}
              <p className="text-sm opacity-90">{data.content || 'Callout content...'}</p>
            </div>
          </div>
        </div>
      )
    }
    case 'list': {
      const items = data.items || ['Item 1', 'Item 2']
      const style = data.listStyle || 'bullet'
      return (
        <div className={wrapCls}>
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-0.5 text-[#0D6E6E] font-bold shrink-0">
                  {style === 'bullet' ? '•' : style === 'numbered' ? `${i + 1}.` : '☐'}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    case 'embed':
      return (
        <div className={wrapCls}>
          <div className="bg-black/30 border border-[#2D3748] rounded-xl p-4 text-center">
            <span className="text-2xl">▶️</span>
            <p className="text-xs text-slate-500 mt-2 truncate">
              {data.url || 'Paste a YouTube URL in settings'}
            </p>
          </div>
        </div>
      )
    case 'button': {
      const btnCls = {
        primary: 'bg-[#0D6E6E] text-white',
        outline: 'border-2 border-[#0D6E6E] text-[#0D6E6E]',
        ghost: 'bg-white/10 text-white',
      }[data.buttonStyle || 'primary']
      return (
        <div className={`${wrapCls} flex justify-center`}>
          <span className={`inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm ${btnCls}`}>
            {data.label || 'Button Label'}
          </span>
        </div>
      )
    }
    case 'spacer':
      return (
        <div className={`${wrapCls} flex items-center gap-3`}>
          <div className="flex-1 border-t border-dashed border-[#2D3748]" />
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">{data.height || 48}px</span>
          <div className="flex-1 border-t border-dashed border-[#2D3748]" />
        </div>
      )
    case 'table': {
      const rows = data.tableData || [];
      const hasHeader = data.hasHeaderRow !== false;
      return (
        <div className={`${wrapCls} overflow-x-auto`}>
          <table className="w-full text-sm text-left border border-[#2D3748] rounded-xl overflow-hidden bg-[#1A1F2E]">
            {rows.length > 0 && hasHeader && (
              <thead>
                <tr>
                  {rows[0].map((cell, i) => (
                    <th key={i} className="px-4 py-2 font-bold border-b border-[#2D3748] bg-black/20 text-white">{cell}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.slice(hasHeader && rows.length > 0 ? 1 : 0).map((row, i) => (
                <tr key={i} className="hover:bg-white/5">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 border-b border-[#2D3748] text-slate-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    default:
      return (
        <div className={`${wrapCls} text-slate-600 text-xs italic`}>Unknown block type</div>
      )
  }
}
