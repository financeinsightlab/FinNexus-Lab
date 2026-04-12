// ─── Block Server-Side Renderer ───────────────────────────────────────────────
// Converts a block tree (JSON) into rendered HTML for public pages.

import { Block, BlockType } from './registry'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getAttrClass(block: Block): string {
  const a = block.attributes
  if (!a) return ''
  const classes = [a.className || ''].filter(Boolean).join(' ')
  return classes
}

function getAttrStyle(block: Block): string {
  const a = block.attributes
  if (!a) return ''
  const styles: string[] = []
  if (a.backgroundColor) styles.push(`background-color: ${a.backgroundColor}`)
  if (a.textColor) styles.push(`color: ${a.textColor}`)
  if (a.padding) styles.push(`padding: ${a.padding}`)
  if (a.margin) styles.push(`margin: ${a.margin}`)
  if (a.textAlign) styles.push(`text-align: ${a.textAlign}`)
  return styles.join('; ')
}

function renderBlock(block: Block): string {
  const style = getAttrStyle(block)
  const styleAttr = style ? ` style="${style}"` : ''
  const { data } = block

  switch (block.type) {
    case 'heading': {
      const level = data.level || 2
      const text = escapeHtml(data.text || '')
      return `<h${level}${styleAttr} class="block-heading">${text}</h${level}>`
    }
    case 'paragraph': {
      return `<div${styleAttr} class="block-paragraph">${data.html || ''}</div>`
    }
    case 'image': {
      const alignClass = {
        left: 'ml-0 mr-auto',
        center: 'mx-auto',
        right: 'ml-auto mr-0',
        full: 'w-full',
      }[data.alignment || 'center']
      const img = `<img src="${escapeHtml(data.src || '')}" alt="${escapeHtml(data.alt || '')}" class="block-image rounded-2xl border border-white/10 shadow-2xl ${alignClass}" loading="lazy" />`
      const cap = data.caption ? `<figcaption class="text-center text-sm text-slate-400 mt-3">${escapeHtml(data.caption)}</figcaption>` : ''
      return `<figure${styleAttr} class="block-figure my-10">${img}${cap}</figure>`
    }
    case 'quote': {
      return `<blockquote${styleAttr} class="block-quote border-l-4 border-[#0D6E6E] pl-6 py-4 my-8 italic text-slate-300 text-lg bg-white/2 rounded-r-2xl">
        <p>${escapeHtml(data.quote || '')}</p>
        ${data.attribution ? `<cite class="block mt-2 text-sm text-[#0D6E6E] font-bold not-italic">— ${escapeHtml(data.attribution)}</cite>` : ''}
      </blockquote>`
    }
    case 'divider': {
      return `<hr${styleAttr} class="block-divider border-none h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12" />`
    }
    case 'columns': {
      const cols = data.columns || []
      const colClass = cols.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
      const innerCols = cols.map(colBlocks => 
        `<div class="block-col">${renderBlocks(colBlocks)}</div>`
      ).join('')
      return `<div${styleAttr} class="block-columns grid ${colClass} gap-8 my-8">${innerCols}</div>`
    }
    case 'callout': {
      const variantStyles: Record<string, string> = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        danger: 'bg-red-500/10 border-red-500/30 text-red-300',
      }
      const cls = variantStyles[data.variant || 'info']
      return `<div${styleAttr} class="block-callout border rounded-2xl p-6 my-6 ${cls}">
        <div class="flex items-start gap-4">
          ${data.icon ? `<span class="text-2xl shrink-0">${data.icon}</span>` : ''}
          <div>
            ${data.title ? `<p class="font-bold text-sm uppercase tracking-widest mb-2">${escapeHtml(data.title)}</p>` : ''}
            <p class="text-sm leading-relaxed">${escapeHtml(data.content || '')}</p>
          </div>
        </div>
      </div>`
    }
    case 'list': {
      const items = (data.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')
      const tag = data.listStyle === 'numbered' ? 'ol' : 'ul'
      const ls = data.listStyle === 'check' ? 'list-none space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-["✓"] [&_li]:before:text-emerald-400' 
               : data.listStyle === 'numbered' ? 'list-decimal list-outside pl-6 space-y-2'
               : 'list-disc list-outside pl-6 space-y-2'
      return `<${tag}${styleAttr} class="block-list my-6 ${ls}">${items}</${tag}>`
    }
    case 'embed': {
      const url = data.url || ''
      if (data.embedType === 'youtube') {
        const ytMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        const vid = ytMatch ? ytMatch[1] : ''
        if (!vid) return `<div class="block-embed-error text-slate-500 text-sm">Invalid YouTube URL</div>`
        return `<div${styleAttr} class="block-embed my-8 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          <iframe src="https://www.youtube.com/embed/${vid}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
        </div>`
      }
      return `<a${styleAttr} href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="block-embed-link block my-6 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[#0D6E6E] hover:bg-white/10 transition-all">${escapeHtml(url)}</a>`
    }
    case 'button': {
      const btnStyles: Record<string, string> = {
        primary: 'bg-[#0D6E6E] text-white hover:bg-[#0F9E9E] shadow-[0_0_20px_rgba(13,110,110,0.3)]',
        outline: 'bg-transparent border-2 border-[#0D6E6E] text-[#0D6E6E] hover:bg-[#0D6E6E] hover:text-white',
        ghost: 'bg-white/5 text-white hover:bg-white/10',
      }
      const cls = btnStyles[data.buttonStyle || 'primary']
      return `<div${styleAttr} class="block-button my-6 flex justify-center">
        <a href="${escapeHtml(data.href || '#')}" class="inline-flex items-center px-8 py-3 rounded-xl font-bold transition-all ${cls}">${escapeHtml(data.label || 'Click here')}</a>
      </div>`
    }
    case 'spacer': {
      const height = data.height || 48
      return `<div${styleAttr} class="block-spacer" style="height: ${height}px"></div>`
    }
    case 'table': {
      const rows = data.tableData || [];
      const hasHeader = data.hasHeaderRow !== false;
      
      let thead = '';
      let tbody = '';
      
      rows.forEach((row, i) => {
        if (i === 0 && hasHeader) {
          const cells = row.map(cell => `<th class="px-4 py-3 text-left font-bold border-b border-[#2D3748] bg-black/20">${escapeHtml(cell)}</th>`).join('');
          thead = `<thead><tr>${cells}</tr></thead>`;
        } else {
          const cells = row.map(cell => `<td class="px-4 py-3 border-b border-[#2D3748]">${escapeHtml(cell)}</td>`).join('');
          tbody += `<tr class="hover:bg-white/5 transition-colors">${cells}</tr>`;
        }
      });
      
      return `
        <div${styleAttr} class="block-table my-8 overflow-x-auto rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
          <table class="w-full text-sm text-left">
            ${thead}
            <tbody>${tbody}</tbody>
          </table>
        </div>
      `;
    }
    default:
      return `<!-- unknown block type: ${(block as Block).type} -->`
  }
}

export function renderBlocks(blocks: Block[]): string {
  return blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(renderBlock)
    .join('\n')
}
