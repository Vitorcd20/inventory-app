

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Package, User, AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react'
import { translateCategory } from '../table/utils'
import { useSale } from '@/hooks/orders/sales'

interface SaleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleCompleted: () => void
}

export function SaleModal({ open, onOpenChange, onSaleCompleted }: SaleModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    submitSale,
    product,
    searchingProduct,
    isStockLow,
    hasInsufficientStock,
    totalValue,
    formatCurrency
  } = useSale(() => {
    onSaleCompleted()
    onOpenChange(false)
  })

  const [quantity] = watch(['quantity'])

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Digite o código do produto e os dados do cliente para processar a venda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitSale)} className="space-y-4">
          
          {errors.root && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="productCode">Código do Produto *</Label>
            <div className="relative">
              <Input
                id="productCode"
                placeholder="Ex: NECK002"
                {...register('productCode')}
                disabled={isSubmitting}
                className={errors.productCode ? 'border-red-500' : ''}
              />
              {searchingProduct && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            {errors.productCode && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.productCode.message}
              </p>
            )}
          </div>

          {product && (
            <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-700">Produto Encontrado</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium">{product.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">Categoria:</span>
                  <p className="font-medium">{translateCategory(product.category.name)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Preço:</span>
                  <p className="font-semibold text-green-600">{formatCurrency(product.salePrice)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Estoque:</span>
                  <div className="flex items-center gap-1">
                    <p className={`font-medium ${isStockLow ? 'text-orange-600' : 'text-gray-700'}`}>
                      {product.quantity} unidades
                    </p>
                    {isStockLow && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>

              {product.description && (
                <div>
                  <span className="text-gray-500 text-sm">Descrição:</span>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer">Nome do Cliente *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="customer"
                placeholder="Digite o nome do cliente"
                {...register('customer')}
                disabled={isSubmitting}
                className={`pl-10 ${errors.customer ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.customer && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.customer.message}
              </p>
            )}
          </div>

          {product && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                {...register('quantity', { valueAsNumber: true })}
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
          )}

          {product && quantity > 0 && !hasInsufficientStock && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">Resumo da Venda</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Produto:</span>
                  <span className="font-medium">{product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Quantidade:</span>
                  <span className="font-medium">{quantity} unidade(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Preço:</span>
                  <span className="font-medium">{formatCurrency(product.salePrice)}</span>
                </div>
                <hr className="border-green-200" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-green-700">Total:</span>
                  <span className="font-bold text-green-800">{formatCurrency(totalValue)}</span>
                </div>
                
                <div className="text-xs text-green-600 mt-2">
                  Estoque após venda: {product.quantity - quantity} unidades
                </div>
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
              disabled={isSubmitting || !product || !!hasInsufficientStock} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Processando...' : 'Finalizar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}