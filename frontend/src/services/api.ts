const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export type Product = {
  id: string
  code: string
  title: string
  description?: string
  categoryId: string
  quantity: number
  unitPrice: number
  salePrice: number
  minStock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
}

export type Category = {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
  createdAt: string
  parent?: {
    id: string
    name: string
  }
}

export type Sale = {
  id: string
  code: string
  date: string
  customer: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED'
  totalValue: number
  discount: number
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: {
      code: string
      title: string
    }
  }>
}

export type CreateProductData = {
  code: string
  title: string
  description?: string
  categoryId: string
  quantity: number
  unitPrice: number
  salePrice: number
  minStock?: number
}

 class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Erro ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Erro na API ${endpoint}:`, error)
      throw error
    }
  }

  
  async getProducts(params?: {
    search?: string
    categoryId?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.search) searchParams.append('search', params.search)
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    return this.request<{
      products: Product[]
      pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
      }
    }>(`/products?${searchParams}`)
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`)
  }

  async getProductByCode(code: string) {
    return this.request<Product>(`/products/code/${code}`)
  }

  async createProduct(data: CreateProductData) {
    return this.request<{ message: string; product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: Partial<CreateProductData>) {
    return this.request<{ message: string; product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async updateStock(id: string, data: {
    quantity: number
    operation?: 'ADD' | 'SUBTRACT' | 'SET'
  }) {
    return this.request<{ message: string; product: Product }>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getLowStockProducts() {
    return this.request<{ message: string; products: Product[] }>('/products/low-stock')
  }


  async getCategories(hierarchical: boolean = false, includeInactive: boolean = false) {
    const params = new URLSearchParams()
    if (hierarchical) params.append('hierarchical', 'true')
    if (includeInactive) params.append('includeInactive', 'true')

    return this.request<{ categories: Category[] }>(`/categories?${params}`)
  }

  async getCategory(id: string) {
    return this.request<Category>(`/categories/${id}`)
  }

  async createCategory(data: {
    name: string
    description?: string
    parentId?: string
  }) {
    return this.request<{ message: string; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: string, data: {
    name?: string
    description?: string
    parentId?: string
    isActive?: boolean
  }) {
    return this.request<{ message: string; category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }


  async getSales(params?: {
    search?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    return this.request<{
      sales: Sale[]
      pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
      }
    }>(`/sales?${searchParams}`)
  }

  async getSale(id: string) {
    return this.request<Sale>(`/sales/${id}`)
  }

  async createSale(data: {
    code: string
    customer: string
    items: Array<{
      productId: string
      quantity: number
    }>
    discount?: number
  }) {
    return this.request<{ message: string; sale: Sale }>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSaleStatus(id: string, status: string) {
    return this.request<{ message: string; sale: Sale }>(`/sales/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async cancelSale(id: string) {
    return this.request<{ message: string }>(`/sales/${id}/cancel`, {
      method: 'PATCH',
    })
  }

  async getSalesReport(params?: {
    startDate?: string
    endDate?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return this.request<{
      period: { startDate: string; endDate: string }
      summary: {
        totalSales: number
        totalValue: number
        totalDiscount: number
        averageTicket: number
      }
      statusSummary: Array<{
        status: string
        _count: { status: number }
        _sum: { totalValue: number }
      }>
      topProducts: Array<{
        productId: string
        quantity: number
        value: number
        title: string
      }>
      sales: Sale[]
    }>(`/sales/report?${searchParams}`)
  }


  async healthCheck() {
    return this.request<{ 
      status: string
      timestamp: string
      service: string
    }>('/../../health') 
  }
}

export const apiService = new ApiService()

export const useApi = () => {
  return {
    products: {
      getAll: (params?: Parameters<typeof apiService.getProducts>[0]) => 
        apiService.getProducts(params),
      getById: (id: string) => apiService.getProduct(id),
      getByCode: (code: string) => apiService.getProductByCode(code),
      create: (data: CreateProductData) => apiService.createProduct(data),
      update: (id: string, data: Partial<CreateProductData>) => 
        apiService.updateProduct(id, data),
      delete: (id: string) => apiService.deleteProduct(id),
      updateStock: (id: string, data: { quantity: number; operation?: 'ADD' | 'SUBTRACT' | 'SET' }) => 
        apiService.updateStock(id, data),
      getLowStock: () => apiService.getLowStockProducts()
    },
    categories: {
      getAll: (hierarchical?: boolean, includeInactive?: boolean) => 
        apiService.getCategories(hierarchical, includeInactive),
      getById: (id: string) => apiService.getCategory(id),
      create: (data: { name: string; description?: string; parentId?: string }) => 
        apiService.createCategory(data),
      update: (id: string, data: { name?: string; description?: string; parentId?: string; isActive?: boolean }) => 
        apiService.updateCategory(id, data),
      delete: (id: string) => apiService.deleteCategory(id)
    },
    sales: {
      getAll: (params?: Parameters<typeof apiService.getSales>[0]) => 
        apiService.getSales(params),
      getById: (id: string) => apiService.getSale(id),
      create: (data: Parameters<typeof apiService.createSale>[0]) => 
        apiService.createSale(data),
      updateStatus: (id: string, status: string) => 
        apiService.updateSaleStatus(id, status),
      cancel: (id: string) => apiService.cancelSale(id),
      getReport: (params?: { startDate?: string; endDate?: string }) => 
        apiService.getSalesReport(params)
    }
  }
}