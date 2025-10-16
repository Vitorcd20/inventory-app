export type Product = {
  id: string
  code: string
  title: string
  description?: string
  quantity: number
  unitPrice: number
  salePrice: number
  minStock: number
  isActive: boolean
  createdAt: string
  category: {
    id: string
    name: string
  }
}

export type ApiResponse = {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export type Category = {
  id: string
  name: string
  isActive: boolean
}

export type CreateProductData = {
  code: string
  title: string
  categoryId: string
  quantity: number
  unitPrice: number
  salePrice: number
  minStock?: number
}