import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

interface CategoryRequest extends Request {
  body: {
    name: string;
    description?: string;
    parentId?: string;
  };
}

class CategoryController {
  async createCategory(req: CategoryRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, parentId } = req.body;

      if (parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId }
        });

        if (!parentCategory) {
          return res.status(400).json({ error: 'Categoria pai não encontrada' });
        }
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          parentId
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listCategories(req: Request, res: Response) {
    try {
      const { includeInactive, hierarchical } = req.query;
      
      let whereClause: any = {};
      
      if (includeInactive !== 'true') {
        whereClause.isActive = true;
      }

      if (hierarchical === 'true') {
        const categories = await prisma.category.findMany({
          where: {
            ...whereClause,
            parentId: null 
          },
          include: {
            children: {
              where: {
                isActive: includeInactive === 'true' ? undefined : true
              },
              include: {
                children: {
                  where: {
                    isActive: includeInactive === 'true' ? undefined : true
                  }
                },
                _count: {
                  select: {
                    products: true
                  }
                }
              }
            },
            _count: {
              select: {
                products: true
              }
            }
          },
          orderBy: { name: 'asc' }
        });

        res.json({ categories });
      } else {
        const categories = await prisma.category.findMany({
          where: whereClause,
          include: {
            parent: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                products: true,
                children: true
              }
            }
          },
          orderBy: { name: 'asc' }
        });

        res.json({ categories });
      }
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          products: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              code: true,
              title: true,
              quantity: true,
              salePrice: true
            },
            orderBy: { title: 'asc' }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, parentId, isActive } = req.body;

      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      if (parentId) {
        if (parentId === id) {
          return res.status(400).json({ error: 'Uma categoria não pode ser pai de si mesma' });
        }

        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId }
        });

        if (!parentCategory) {
          return res.status(400).json({ error: 'Categoria pai não encontrada' });
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(parentId !== undefined && { parentId }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) })
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({
        message: 'Categoria atualizada com sucesso',
        category
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const categoryWithData = await prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
          children: true
        }
      });

      if (!categoryWithData) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      if (categoryWithData.products.length > 0 || categoryWithData.children.length > 0) {
        await prisma.category.update({
          where: { id },
          data: { isActive: false }
        });

        res.json({ 
          message: 'Categoria desativada com sucesso (possui produtos ou subcategorias associadas)' 
        });
      } else {
        await prisma.category.delete({
          where: { id }
        });

        res.json({ message: 'Categoria deletada com sucesso' });
      }
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new CategoryController();