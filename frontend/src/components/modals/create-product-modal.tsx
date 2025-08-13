/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/pages/products/utils'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'
import { translateCategory } from '../table/utils'
import { toast } from 'sonner'
import { calculateProfitMargin } from '@/schemas/product-schema'

interface CreateProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated: () => void
  registerCreate: any
  handleSubmitCreate: any
  createFormState: any
  watchCreate: any
  setCreateValue: any
  resetCreateForm: () => void
  categories: Array<{ id: string; name: string }>
  loadingCategories: boolean
  submitCreate: (data: any) => Promise<void>
}

export const CreateProductModal = React.memo(function CreateProductModal({ 
  open, 
  onOpenChange, 
  onProductCreated,
  registerCreate,
  handleSubmitCreate,
  createFormState,
  watchCreate,
  setCreateValue,
  resetCreateForm,
  categories,
  loadingCategories,
  submitCreate
}: CreateProductModalProps) {
  
  const { errors, isSubmitting } = createFormState
  const [unitPrice, salePrice, categoryId] = watchCreate(['unitPrice', 'salePrice', 'categoryId'])

  const handleReset = useCallback(() => {
    if (open) {
      resetCreateForm()
    }
  }, [open, resetCreateForm])

  useEffect(() => {
    handleReset()
  }, [handleReset])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }, [isSubmitting, onOpenChange])

  const onSubmit = useCallback(async (data: any) => {
    try {
      await submitCreate(data)
      onProductCreated()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        duration: 5000,
      })
    }
  }, [submitCreate, onProductCreated, onOpenChange])

  const profitMargin = React.useMemo(() => {
    return unitPrice > 0 && salePrice > 0 ? calculateProfitMargin(unitPrice, salePrice) : 0
  }, [unitPrice, salePrice])

  const profitAmount = React.useMemo(() => {
    return unitPrice > 0 && salePrice > 0 ? salePrice - unitPrice : 0
  }, [unitPrice, salePrice])

  const handleCategoryChange = useCallback((value: string) => {
    setCreateValue('categoryId', value)
  }, [setCreateValue])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Novo Produto
            </div>
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo produto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitCreate(onSubmit)} className="space-y-4">
          
          {errors.root && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              placeholder="Ex: PRD001"
              {...registerCreate('code')}
              disabled={isSubmitting}
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Nome do produto"
              {...registerCreate('title')}
              disabled={isSubmitting}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 p-2 border rounded">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando categorias...
              </div>
            ) : (
              <Select
                value={categoryId || ''}
                onValueChange={handleCategoryChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {translateCategory(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Estoque *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                {...registerCreate('quantity', { valueAsNumber: true })}
                disabled={isSubmitting}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                placeholder="0"
                {...registerCreate('minStock', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.minStock && (
                <p className="text-sm text-red-500">{errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Preço Unitário *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...registerCreate('unitPrice', { valueAsNumber: true })}
                disabled={isSubmitting}
                className={errors.unitPrice ? 'border-red-500' : ''}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.unitPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...registerCreate('salePrice', { valueAsNumber: true })}
                disabled={isSubmitting}
                className={errors.salePrice ? 'border-red-500' : ''}
              />
              {errors.salePrice && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.salePrice.message}
                </p>
              )}
            </div>
          </div>

          {unitPrice > 0 && salePrice > 0 && (
            <div className={`p-3 rounded-lg border ${
              profitMargin < 5 ? 'bg-red-50 border-red-200' :
              profitMargin < 10 ? 'bg-yellow-50 border-yellow-200' : 
              'bg-green-50 border-green-200'
            }`}>
              <div className={`text-sm space-y-1 ${
                profitMargin < 5 ? 'text-red-700' :
                profitMargin < 10 ? 'text-yellow-700' : 
                'text-green-700'
              }`}>
                <div className="flex justify-between items-center">
                  <span>Margem de lucro:</span>
                  <span className="font-semibold">
                    {profitMargin.toFixed(1)}%
                    {profitMargin < 5 && ' ⚠️'}
                    {profitMargin >= 10 && ' ✅'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lucro por unidade:</span>
                  <span className="font-medium">
                    {formatCurrency(profitAmount)}
                  </span>
                </div>
                {profitMargin < 5 && (
                  <p className="text-xs mt-1 text-red-600">
                    ⚠️ Margem muito baixa - considere ajustar os preços
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingCategories}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Criando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})