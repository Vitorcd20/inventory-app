import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'

type Product = {
  id: string
  code: string
  title: string
  quantity: number
}

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmationModal({ 
  open, 
  onOpenChange, 
  product, 
  onConfirm, 
  loading = false 
}: DeleteConfirmationModalProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>

        {/* Removido DialogDescription e usado div simples */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este produto?
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <div className="text-sm">
              <strong>Código:</strong> {product.code}
            </div>
            <div className="text-sm">
              <strong>Nome:</strong> {product.title}
            </div>
            <div className="text-sm">
              <strong>Estoque:</strong> {product.quantity} unidades
            </div>
          </div>
          
          {product.quantity > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Este produto possui estoque disponível. A exclusão não poderá ser desfeita.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}