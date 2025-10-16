export type Sale = {
  id: string;
  code: string;
  date: string;
  customer: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED';
  totalValue: number;
  discount: number;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      code: string;
      title: string;
    };
  }[];
};

export type DashboardData = {
  kpis: {
    totalSales: number
    salesGrowth: number
    totalRevenue: number
    revenueGrowth: number
    totalProducts: number
    totalCustomers: number
    lowStockProducts: number
    pendingOrders: number
  }
  recentSales: Array<{
    id: string
    code: string
    customer: string
    totalValue: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED'
    date: Date
  }>
  topProducts: Array<{
    id: string
    name: string
    category: string
    sold: number
    revenue: number
  }>
  lowStockProducts: Array<{
    id: string
    title: string
    quantity: number
    minStock: number
    category: {
      name: string
    }
  }>
  salesByCategory: Array<{
    category: string
    value: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    sales: number
    revenue: number
  }>
}