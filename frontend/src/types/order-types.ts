
export interface OrderItem {
  id: string
  product: {
    id: string
    title: string
    code: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  code: string
  date: string
  customer: string
  items: OrderItem[]
  totalValue: number
  discount: number
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}