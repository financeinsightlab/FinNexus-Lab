// ─── Block Type Registry ─────────────────────────────────────────────────────
// Central registry of all supported block types, their default data, 
// and metadata (icon, label, category).

export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'quote'
  | 'divider'
  | 'columns'
  | 'callout'
  | 'list'
  | 'embed'
  | 'button'
  | 'spacer'
  | 'table'

export interface BlockData {
  // heading
  text?: string
  level?: 1 | 2 | 3 | 4
  // paragraph
  html?: string
  // image
  src?: string
  alt?: string
  caption?: string
  alignment?: 'left' | 'center' | 'right' | 'full'
  // quote
  quote?: string
  attribution?: string
  // columns
  columns?: Block[][]
  columnCount?: 2 | 3
  // callout
  icon?: string
  variant?: 'info' | 'warning' | 'success' | 'danger'
  title?: string
  content?: string
  // list
  items?: string[]
  listStyle?: 'bullet' | 'numbered' | 'check'
  // embed
  url?: string
  embedType?: 'youtube' | 'twitter' | 'generic'
  // button
  label?: string
  href?: string
  buttonStyle?: 'primary' | 'outline' | 'ghost'
  // spacer
  height?: number
  // table
  tableData?: string[][]
  hasHeaderRow?: boolean
}

export interface BlockAttributes {
  className?: string
  id?: string
  backgroundColor?: string
  textColor?: string
  padding?: string
  margin?: string
  borderRadius?: string
  textAlign?: 'left' | 'center' | 'right'
  fontWeight?: 'normal' | 'bold'
  fontSize?: string
}

export interface Block {
  id: string
  type: BlockType
  data: BlockData
  attributes?: BlockAttributes
  order: number
  children?: Block[]
}

export interface BlockMeta {
  type: BlockType
  label: string
  description: string
  icon: string // lucide icon name
  category: 'text' | 'media' | 'layout' | 'interactive'
  defaultData: BlockData
}

// Registry of all block types with defaults
export const BLOCK_REGISTRY: BlockMeta[] = [
  {
    type: 'heading',
    label: 'Heading',
    description: 'Section heading (H1–H4)',
    icon: 'Heading',
    category: 'text',
    defaultData: { text: 'Section Heading', level: 2 }
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Rich text paragraph block',
    icon: 'AlignLeft',
    category: 'text',
    defaultData: { html: '<p>Start writing your content here...</p>' }
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Single image with optional caption',
    icon: 'Image',
    category: 'media',
    defaultData: { src: '', alt: '', caption: '', alignment: 'center' }
  },
  {
    type: 'quote',
    label: 'Blockquote',
    description: 'Highlighted quote or pull quote',
    icon: 'Quote',
    category: 'text',
    defaultData: { quote: 'Enter your quote here...', attribution: '' }
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Horizontal rule separator',
    icon: 'Minus',
    category: 'layout',
    defaultData: {}
  },
  {
    type: 'columns',
    label: 'Columns',
    description: '2 or 3 column side-by-side layout',
    icon: 'Columns',
    category: 'layout',
    defaultData: { 
      columnCount: 2,
      columns: [
        [{ id: 'col-l-1', type: 'paragraph', data: { html: '<p>Left column content...</p>' }, order: 0 }],
        [{ id: 'col-r-1', type: 'paragraph', data: { html: '<p>Right column content...</p>' }, order: 0 }]
      ]
    }
  },
  {
    type: 'callout',
    label: 'Callout Box',
    description: 'Info, Warning, Success, or Danger callout',
    icon: 'AlertTriangle',
    category: 'layout',
    defaultData: { variant: 'info', title: 'Key Insight', content: 'Add your callout content here...', icon: '💡' }
  },
  {
    type: 'list',
    label: 'List',
    description: 'Bullet, numbered, or checklist',
    icon: 'List',
    category: 'text',
    defaultData: { items: ['First item', 'Second item', 'Third item'], listStyle: 'bullet' }
  },
  {
    type: 'embed',
    label: 'Embed',
    description: 'YouTube video or Tweet embed',
    icon: 'Play',
    category: 'media',
    defaultData: { url: '', embedType: 'youtube' }
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Call-to-action button',
    icon: 'MousePointer',
    category: 'interactive',
    defaultData: { label: 'Read More', href: '#', buttonStyle: 'primary' }
  },
  {
    type: 'spacer',
    label: 'Spacer',
    description: 'Vertical spacing block',
    icon: 'ArrowUpDown',
    category: 'layout',
    defaultData: { height: 48 }
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Data table with rows and columns',
    icon: 'Layout', // using Layout as table icon fallback or choose another
    category: 'text',
    defaultData: { 
      hasHeaderRow: true, 
      tableData: [
        ['Header 1', 'Header 2'],
        ['Row 1, Cell 1', 'Row 1, Cell 2'],
        ['Row 2, Cell 1', 'Row 2, Cell 2'],
      ]
    }
  }
]

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return BLOCK_REGISTRY.find(b => b.type === type)
}

export function createBlock(type: BlockType, overrides: Partial<BlockData> = {}): Block {
  const meta = getBlockMeta(type)
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: { ...meta?.defaultData, ...overrides },
    order: 0
  }
}

export const BLOCK_CATEGORIES = [
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'media', label: 'Media', icon: 'Image' },
  { id: 'layout', label: 'Layout', icon: 'Layout' },
  { id: 'interactive', label: 'Interactive', icon: 'Zap' },
] as const
