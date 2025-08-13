import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Product } from '@/types/product-types'
import { LoaderCircle } from 'lucide-react'
import { useUpdateProduct } from '@/hooks/products/edit-product-hook'

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onProductUpdated: () => void
  categories?: Array<{ id: string; name: string }>
}

export function EditProductModal({ 
  open, 
  onOpenChange, 
  product, 
  onProductUpdated,
}: EditProductModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
    submitUpdate
  } = useUpdateProduct(product?.id || null, () => {
    onProductUpdated()
    onOpenChange(false)
    reset()
    setSelectedCategoryId('')
  })

  const categoryIdValue = watch('categoryId')

  useEffect(() => {
    if (product && open) {
      setValue('code', product.code)
      setValue('title', product.title)
      setValue('description', product.description || '')
      
      const categoryId = product.category?.id || ''
      setValue('categoryId', categoryId)
      setSelectedCategoryId(categoryId)
      
      setValue('quantity', product.quantity)
      setValue('unitPrice', product.unitPrice)
      setValue('salePrice', product.salePrice)
      setValue('minStock', product.minStock || 0)
    }
  }, [product, open, setValue])

  useEffect(() => {
    if (categoryIdValue !== selectedCategoryId) {
      setSelectedCategoryId(categoryIdValue || '')
    }
  }, [categoryIdValue, selectedCategoryId])

  useEffect(() => {
    if (!open) {
      reset()
      setSelectedCategoryId('')
    }
  }, [open, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    await submitUpdate(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="Ex: PC001"
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Nome do produto"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição detalhada do produto"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register('quantity', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                {...register('minStock', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.minStock && (
                <p className="text-sm text-red-500">{errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Preço de Custo *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('unitPrice', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                {...register('salePrice', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.salePrice && (
                <p className="text-sm text-red-500">{errors.salePrice.message}</p>
              )}
            </div>
          </div>

          <input type="hidden" {...register('categoryId')} />

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}