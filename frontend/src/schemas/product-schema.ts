import { z } from 'zod'

export const createProductSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  quantity: z.number().min(0, 'Quantidade deve ser maior ou igual a zero'),
  unitPrice: z.number().min(0, 'Preço de custo deve ser maior ou igual a zero'),
  salePrice: z.number().min(0, 'Preço de venda deve ser maior ou igual a zero'),
  minStock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
})

export const editProductSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  quantity: z.number().min(0, 'Quantidade deve ser maior ou igual a zero'),
  unitPrice: z.number().min(0, 'Preço de custo deve ser maior ou igual a zero'),
  salePrice: z.number().min(0, 'Preço de venda deve ser maior ou igual a zero'),
  minStock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
export type EditProductFormData = z.infer<typeof editProductSchema>

export const calculateProfitMargin = (unitPrice: number, salePrice: number): number => {
  if (unitPrice <= 0) return 0
  return ((salePrice - unitPrice) / unitPrice) * 100
}