import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DashboardController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      console.log('Carregando dashboard...')
      
      const [
        totalSales, 
        pendingSales, 
        confirmedSales, 
        cancelledSales,
        totalProducts,
        totalRevenue,
        topProducts
      ] = await Promise.all([
        prisma.sale.count(),
        prisma.sale.count({ where: { status: 'PENDING' } }),
        prisma.sale.count({ where: { status: 'CONFIRMED' } }),
        prisma.sale.count({ where: { status: 'CANCELLED' } }),
        prisma.product.count(),
        prisma.sale.aggregate({
          _sum: { totalValue: true },
          where: { status: { not: 'CANCELLED' } }
        }),
        prisma.saleItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5
        })
      ])

      const recentSales = await prisma.sale.findMany({
        take: 5,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  salePrice: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const lowStockProductsList = await prisma.product.findMany({
        where: {
          OR: [
            { quantity: { lt: 10 } }, 
            { quantity: 0 }
          ]
        },
        take: 10,
        include: {
          category: {
            select: { name: true }
          }
        }
      })

      const lowStockCount = lowStockProductsList.length

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: true }
          })
          return {
            id: product?.id || '',
            name: product?.title || 'Produto não encontrado',
            category: product?.category?.name || 'Sem categoria',
            sold: item._sum.quantity || 0,
            revenue: (product?.salePrice || 0) * (item._sum.quantity || 0)
          }
        })
      )

      const uniqueCustomers = await prisma.sale.findMany({
        select: { customer: true },
        distinct: ['customer']
      })

      const salesByCategory = await prisma.sale.findMany({
        include: {
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          }
        }
      })

      const categoryMap = new Map()
      let totalCategoryRevenue = 0

      salesByCategory.forEach(sale => {
        sale.items.forEach(item => {
          const categoryName = item.product.category?.name || 'Sem categoria'
          const itemRevenue = item.unitPrice * item.quantity
          
          if (categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, categoryMap.get(categoryName) + itemRevenue)
          } else {
            categoryMap.set(categoryName, itemRevenue)
          }
          
          totalCategoryRevenue += itemRevenue
        })
      })

      const salesByCategoryArray = Array.from(categoryMap.entries()).map(([category, value]) => ({
        category,
        value,
        percentage: totalCategoryRevenue > 0 ? (value / totalCategoryRevenue) * 100 : 0
      }))

      const dashboardData = {
        kpis: {
          totalSales,
          salesGrowth: 5.2, 
          totalRevenue: totalRevenue._sum.totalValue || 0,
          revenueGrowth: 8.1, 
          totalProducts,
          totalCustomers: uniqueCustomers.length,
          lowStockProducts: lowStockCount,
          pendingOrders: pendingSales
        },
        recentSales: recentSales.map(sale => ({
          id: sale.id,
          code: sale.code,
          customer: sale.customer,
          totalValue: sale.totalValue,
          status: sale.status,
          date: sale.date || sale.createdAt
        })),
        topProducts: topProductsWithDetails,
        lowStockProducts: lowStockProductsList.map(product => ({
          id: product.id,
          title: product.title,
          quantity: product.quantity,
          minStock: product.minStock || 10, 
          category: {
            name: product.category?.name || 'Sem categoria'
          }
        })),
        salesByCategory: salesByCategoryArray,
        monthlyTrend: [
          { month: 'Jan', sales: 45, revenue: 12000 },
          { month: 'Fev', sales: 52, revenue: 15000 },
          { month: 'Mar', sales: 48, revenue: 13500 },
          { month: 'Abr', sales: 61, revenue: 18000 },
          { month: 'Mai', sales: totalSales, revenue: totalRevenue._sum.totalValue || 0 }
        ] // Mock data for now - you can calculate real monthly trends
      }

      console.log('✅ Dashboard carregado com sucesso')
      res.json(dashboardData)
      
    } catch (error) {
      console.error('💥 Erro ao carregar dashboard:', error)
      res.status(500).json({ 
        error: 'Erro ao carregar dashboard',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  async getKPIsEndpoint(req: Request, res: Response) {
    try {
      console.log('📈 Calculando KPIs...')
      
      const [
        totalRevenue,
        totalSales,
        avgSaleValue,
        topProducts
      ] = await Promise.all([
        prisma.sale.aggregate({
          _sum: { totalValue: true },
          where: { status: { not: 'CANCELLED' } }
        }),
        
        prisma.sale.count({
          where: { status: { not: 'CANCELLED' } }
        }),
        
        prisma.sale.aggregate({
          _avg: { totalValue: true },
          where: { status: { not: 'CANCELLED' } }
        }),
        
        prisma.saleItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          _count: { productId: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5
        })
      ])

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { code: true, title: true, salePrice: true }
          })
          return {
            ...product,
            totalQuantity: item._sum.quantity,
            salesCount: item._count.productId
          }
        })
      )

      const kpis = {
        totalRevenue: totalRevenue._sum.totalValue || 0,
        totalSales,
        averageSaleValue: avgSaleValue._avg.totalValue || 0,
        topProducts: topProductsWithDetails
      }

      console.log('KPIs calculados com sucesso')
      res.json(kpis)
      
    } catch (error) {
      console.error('💥 Erro ao calcular KPIs:', error)
      res.status(500).json({ 
        error: 'Erro ao calcular KPIs',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  async refreshDashboard(req: Request, res: Response) {
    try {
      console.log('🔄 Atualizando dados do dashboard...')
      
      await this.getDashboard(req, res)
      
    } catch (error) {
      console.error('💥 Erro ao atualizar dashboard:', error)
      res.status(500).json({ 
        error: 'Erro ao atualizar dashboard',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }
}