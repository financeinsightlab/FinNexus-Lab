# FinNexus Lab Corporate Design System

## Overview
Unified design system for a professional financial services platform with corporate aesthetics.

## Color Palette

### Primary Colors
- **Navy (Primary):** `#1A2B3C` - Used for headers, navigation, and primary branding
- **Teal (Accent):** `#0D6E6E` - Used for CTAs, highlights, and interactive elements
- **Slate (Secondary):** `#4A5568` - Used for body text and secondary elements

### Secondary Colors
- **Gold:** `#92620A` - Used for premium features and highlights
- **Green:** `#1A5C3A` - Used for success states and positive metrics
- **Red:** `#9B2335` - Used for errors, warnings, and negative metrics

### Neutral Colors
- **Silver:** `#EEF2F7` - Used for backgrounds and subtle UI elements
- **Cream:** `#FAFAF8` - Used for light backgrounds
- **White:** `#FFFFFF` - Used for cards and content backgrounds
- **Gray-900:** `#111827` - Used for dark text

## Typography

### Font Families
- **Primary (Sans-serif):** `Inter` - Used for UI, navigation, and body text
- **Secondary (Serif):** `Source Serif 4` - Used for reports, articles, and long-form content
- **Monospace:** `IBM Plex Mono` - Used for code, data, and technical content

### Font Scale
- **H1:** `3.5rem` (56px) - Page headers
- **H2:** `2.5rem` (40px) - Section headers
- **H3:** `1.875rem` (30px) - Subsection headers
- **H4:** `1.5rem` (24px) - Card titles
- **H5:** `1.25rem` (20px) - Small headers
- **Body Large:** `1.125rem` (18px) - Article body
- **Body:** `1rem` (16px) - Default body text
- **Small:** `0.875rem` (14px) - Captions, labels
- **X-Small:** `0.75rem` (12px) - Microcopy, tags

### Font Weights
- **Light:** 300
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700
- **Extra Bold:** 800

## Spacing System
Based on 4px unit (0.25rem)

- **xs:** 4px (0.25rem)
- **sm:** 8px (0.5rem)
- **md:** 16px (1rem)
- **lg:** 24px (1.5rem)
- **xl:** 32px (2rem)
- **2xl:** 48px (3rem)
- **3xl:** 64px (4rem)
- **4xl:** 80px (5rem)

## Border Radius
- **xs:** 4px (0.25rem) - Small elements, tags
- **sm:** 8px (0.5rem) - Buttons, inputs
- **md:** 12px (0.75rem) - Cards, containers
- **lg:** 16px (1rem) - Large containers
- **xl:** 24px (1.5rem) - Hero sections
- **full:** 9999px - Pills, avatars

## Shadows
- **sm:** `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md:** `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg:** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl:** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **2xl:** `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

## Component Library

### Buttons
All buttons use consistent padding, border-radius, and transition properties.

**Primary Button:**
- Background: `brand-navy`
- Text: White
- Hover: `brand-teal`
- Padding: `px-5 py-2.5`
- Border Radius: `rounded-xl`
- Shadow: `shadow-sm`

**Secondary Button (Outline):**
- Border: `1px solid brand-navy`
- Text: `brand-navy`
- Hover: Background `brand-navy`, text white
- Padding: `px-5 py-2.5`
- Border Radius: `rounded-xl`

**Ghost Button:**
- Text: `brand-teal`
- Hover: Text expands (`tracking-wider`)
- No background or border
- Padding: `px-4 py-2`

### Cards
- Background: White
- Border: `1px solid gray-200`
- Border Radius: `rounded-xl`
- Shadow: `shadow-md`
- Hover: `shadow-lg` and slight upward translate
- Padding: `p-6`

### Section Headers
- Label: `section-label` class (uppercase, tracking-widest, text-brand-teal)
- Title: H2 with appropriate spacing
- Alignment options: left, center, right

### Inputs
- Border: `1px solid gray-300`
- Border Radius: `rounded-lg`
- Focus: `border-teal-600` with `ring-2 ring-teal-600/20`
- Padding: `px-4 py-3`

### Tags
- Background: Color-specific with 10% opacity
- Text: Color-specific dark variant
- Border Radius: `rounded-md`
- Font: `text-[10px] font-bold uppercase tracking-widest`
- Padding: `px-2.5 py-1`

## Layout Guidelines

### Container
- Max Width: `1280px`
- Padding: `px-4 sm:px-6 lg:px-10`
- Class: `.wrap`

### Grid System
1. Use Tailwind's responsive grid classes
2. Default gap: `gap-6`
3. Breakpoints follow Tailwind defaults

### Hero Sections
- Background: `bg-brand-navy`
- Text Color: White
- Padding: `py-20` (desktop), `py-16` (mobile)
- Gradient overlays for visual interest

### Content Sections
- Background alternates between white and `brand-silver`
- Padding: `py-20` for major sections, `py-16` for minor sections
- Consistent vertical rhythm

## Responsive Design
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## Animation & Transitions
- **Default Duration:** 200ms
- **Easing:** `ease-out`
- **Hover Effects:** Subtle scale, shadow, or color changes
- **Page Transitions:** Fade-in animations for content

## Accessibility
- Minimum contrast ratio of 4.5:1 for text
- Focus states clearly visible
- Semantic HTML structure
- ARIA labels where appropriate

## Implementation Notes
1. Use Tailwind CSS utility classes
2. Extend design tokens in `tailwind.config.ts`
3. Create reusable React components in `/components/ui/`
4. Maintain consistency across all pages
5. Document any deviations from this system