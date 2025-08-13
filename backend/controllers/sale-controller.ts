import { PrismaClient, SaleStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const prismaClient = new PrismaClient();

interface SaleRequest extends Request {
  body: {
    code: string;
    customer: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    discount?: number;
  };
}

interface SaleItemType {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

class SaleController {
  async createSale(req: SaleRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, customer, items, discount = 0 } = req.body;

      const existingSale = await prismaClient.sale.findUnique({
        where: { code }
      });

      if (existingSale) {
        return res.status(400).json({ error: 'Venda com este código já existe' });
      }

      let totalValue = 0;
      const validatedItems: SaleItemType[] = [];

      for (const item of items) {
        const product = await prismaClient.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return res.status(400).json({ 
            error: `Produto com ID ${item.productId} não encontrado` 
          });
        }

        if (!product.isActive) {
          return res.status(400).json({ 
            error: `Produto ${product.title} está inativo` 
          });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto ${product.title}. Disponível: ${product.quantity}` 
          });
        }

        const subtotal = product.salePrice * item.quantity;
        totalValue += subtotal;

        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.salePrice,
          subtotal
        });
      }

      const finalTotal = totalValue - discount;
      if (finalTotal < 0) {
        return res.status(400).json({ error: 'Desconto não pode ser maior que o valor total' });
      }

      const sale = await prismaClient.$transaction(async (prisma) => {
        const newSale = await prisma.sale.create({
          data: {
            code,
            customer,
            totalValue: finalTotal,
            discount,
            status: 'PENDING'
          }
        });

        await prisma.saleItem.createMany({
          data: validatedItems.map(item => ({
            saleId: newSale.id,
            ...item
          }))
        });

        for (const item of validatedItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }

        return newSale;
      });

      const completeSale = await prismaClient.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  code: true,
                  title: true,
                  category: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        message: 'Venda criada com sucesso',
        sale: completeSale
      });
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listSales(req: Request, res: Response) {
    try {
      const { 
        search, 
        status, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10 
      } = req.query;
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereClause: any = {};
      
      if (search) {
        whereClause.OR = [
          { code: { contains: search as string, mode: 'insensitive' } },
          { customer: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (status) {
        whereClause.status = status.toString().toUpperCase() as SaleStatus;
      }

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.date.lte = new Date(endDate as string);
        }
      }

      const [sales, total] = await Promise.all([
        prismaClient.sale.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit as string),
          orderBy: { date: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    code: true,
                    title: true
                  }
                }
              }
            }
          }
        }),
        prismaClient.sale.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.json({
        sales,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getSaleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const sale = await prismaClient.sale.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json(sale);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getSaleByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      const sale = await prismaClient.sale.findUnique({
        where: { code },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json(sale);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateSaleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses: SaleStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'DELIVERED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const sale = await prismaClient.sale.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: {
                select: {
                  code: true,
                  title: true
                }
              }
            }
          }
        }
      });

      res.json({
        message: 'Status da venda atualizado com sucesso',
        sale
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      console.error('Erro ao atualizar status da venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async cancelSale(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sale = await prismaClient.sale.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      if (sale.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Venda já está cancelada' });
      }

      if (sale.status === 'DELIVERED') {
        return res.status(400).json({ error: 'Não é possível cancelar uma venda já entregue' });
      }

      await prismaClient.$transaction(async (prisma) => {
        await prisma.sale.update({
          where: { id },
          data: { status: 'CANCELLED' }
        });

        for (const item of sale.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }
      });

      res.json({ message: 'Venda cancelada e estoque restituído com sucesso' });
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async salesReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      let whereClause: any = {};
      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date.gte = new Date(startDate as string);
        if (endDate) whereClause.date.lte = new Date(endDate as string);
      }

      const [sales, summary] = await Promise.all([
        prismaClient.sale.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    title: true,
                    category: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { date: 'desc' }
        }),
        prismaClient.sale.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true },
          _sum: { totalValue: true }
        })
      ]);

      const totalSales = sales.length;
      const totalValue = sales.reduce((acc, sale) => acc + sale.totalValue, 0);
      const totalDiscount = sales.reduce((acc, sale) => acc + sale.discount, 0);

      const productSales: { [key: string]: { quantity: number; value: number; title: string } } = {};
      
      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              quantity: 0,
              value: 0,
              title: item.product.title
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].value += item.subtotal;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      res.json({
        period: {
          startDate: startDate || 'Início',
          endDate: endDate || 'Atual'
        },
        summary: {
          totalSales,
          totalValue,
          totalDiscount,
          averageTicket: totalSales > 0 ? totalValue / totalSales : 0
        },
        statusSummary: summary,
        topProducts,
        sales
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new SaleController();