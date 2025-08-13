import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

interface ProductRequest extends Request {
  body: {
    code: string;
    title: string;
    description?: string;
    categoryId: string;
    quantity: number;
    unitPrice: number;
    salePrice: number;
    minStock?: number;
  };
}

interface StockRequest extends Request {
  body: {
    quantity: number;
    operation?: 'ADD' | 'SUBTRACT' | 'SET';
  };
  params: {
    id: string;
  };
}

class ProductController {
  async createProduct(req: ProductRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, title, description, categoryId, quantity, unitPrice, salePrice, minStock = 0 } = req.body;

      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }

      const existingProduct = await prisma.product.findUnique({
        where: { code }
      });

      if (existingProduct) {
        return res.status(400).json({ error: 'Produto com este código já existe' });
      }

      const product = await prisma.product.create({
        data: {
          code,
          title,
          description,
          categoryId,
          quantity: parseInt(quantity.toString()),
          unitPrice: parseFloat(unitPrice.toString()),
          salePrice: parseFloat(salePrice.toString()),
          minStock: parseInt(minStock.toString())
        },
        include: {
          category: true
        }
      });

      res.status(201).json({
        message: 'Produto criado com sucesso',
        product
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listProducts(req: Request, res: Response) {
    try {
      const { search, categoryId, isActive, page = 1, limit = 10 } = req.query;
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereClause: any = {};
      
      if (search) {
        whereClause.OR = [
          { code: { contains: search as string, mode: 'insensitive' } },
          { title: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (categoryId) {
        whereClause.categoryId = categoryId as string;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.product.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.json({
        products,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          saleItems: {
            include: {
              sale: {
                select: {
                  code: true,
                  date: true,
                  customer: true
                }
              }
            },
            orderBy: {
              sale: {
                date: 'desc'
              }
            },
            take: 5 
          }
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getProductByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      const product = await prisma.product.findUnique({
        where: { code },
        include: {
          category: true
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, categoryId, quantity, unitPrice, salePrice, minStock, isActive } = req.body;

      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        });

        if (!category) {
          return res.status(400).json({ error: 'Categoria não encontrada' });
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(categoryId && { categoryId }),
          ...(quantity !== undefined && { quantity: parseInt(quantity) }),
          ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
          ...(salePrice !== undefined && { salePrice: parseFloat(salePrice) }),
          ...(minStock !== undefined && { minStock: parseInt(minStock) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) })
        },
        include: {
          category: true
        }
      });

      res.json({
        message: 'Produto atualizado com sucesso',
        product
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const productWithSales = await prisma.product.findUnique({
        where: { id },
        include: {
          saleItems: true
        }
      });

      if (!productWithSales) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      if (productWithSales.saleItems.length > 0) {
        await prisma.product.update({
          where: { id },
          data: { isActive: false }
        });

        res.json({ message: 'Produto desativado com sucesso (possui histórico de vendas)' });
      } else {
        await prisma.product.delete({
          where: { id }
        });

        res.json({ message: 'Produto deletado com sucesso' });
      }
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateStock(req: StockRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'SET' } = req.body;

      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      let newQuantity: number;
      if (operation === 'ADD') {
        newQuantity = product.quantity + parseInt(quantity.toString());
      } else if (operation === 'SUBTRACT') {
        newQuantity = product.quantity - parseInt(quantity.toString());
        if (newQuantity < 0) {
          return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
        }
      } else {
        newQuantity = parseInt(quantity.toString());
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { quantity: newQuantity },
        include: {
          category: true
        }
      });

      const isLowStock = newQuantity <= product.minStock;

      res.json({
        message: 'Estoque atualizado com sucesso',
        product: updatedProduct,
        warning: isLowStock ? `Estoque abaixo do mínimo (${product.minStock})` : null
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getLowStockProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { quantity: { lte: prisma.product.fields.minStock } },
            { quantity: 0 }
          ]
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        }
      });

      res.json({
        message: `${products.length} produtos com estoque baixo`,
        products
      });
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new ProductController();