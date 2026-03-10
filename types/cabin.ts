export interface Cabin {
  id: string
  name: string | { es?: string; en?: string; pt?: string }
  description?: string | { es?: string; en?: string; pt?: string }
  image?: string
  images?: string[]
  capacity?: number
  floor?: string
  amenities?: Record<string, boolean> | string[]
  createdAt?: any
  updatedAt?: any
}
