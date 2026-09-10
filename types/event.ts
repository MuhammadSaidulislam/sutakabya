export interface EventCollection {
  slug: string
  name: string
  tagline: string
  description: string
  image: string
  theme: 'rainbow' | 'coral' | 'sunny' | 'teal' | 'violet' | 'bubblegum'
  tag: string
  startDate: string
  endDate: string
}