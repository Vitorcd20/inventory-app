import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { formatCurrency, formatDate } from '@/pages/products/utils'
import type { Sale } from '@/types/sale-types'
import {
  Calculator,
  Calendar,
  DollarSign,
  Hash,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  User
} from 'lucide-react'

interface SaleDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Sale | null
}

export function SaleDetailsModal({ open, onOpenChange, sale }: SaleDetailsModalProps) {
  if (!sale) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendente' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Confirmado' },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getTotalItems = (): number => {
    return sale.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = (): number => {
    return sale.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              Detalhes da Venda
            </div>
          </DialogTitle>
          <DialogDescription>
            Informações completas da venda {sale.code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Código da venda:</span>
                  <span className="font-mono text-sm font-medium">{sale.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(sale.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getStatusBadge(sale.status)}
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nome:</span>
                  <span className="text-sm font-medium">{sale.customer}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <Package className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="text-xs text-gray-600">Total de Itens</div>
                  <div className="font-semibold text-base">{getTotalItems()}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <div className="text-xs text-gray-600">Subtotal</div>
                  <div className="font-semibold text-base text-green-600">{formatCurrency(getSubtotal())}</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-md">
                  <Tag className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                  <div className="text-xs text-gray-600">Desconto</div>
                  <div className="font-semibold text-base text-orange-600">{formatCurrency(sale.discount)}</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-md">
                  <Receipt className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                  <div className="text-xs text-gray-600">Total Final</div>
                  <div className="font-bold text-lg text-emerald-600">{formatCurrency(sale.totalValue)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Itens da Venda ({sale.items.length})
              </CardTitle>
              <CardDescription className="text-sm">
                Produtos incluídos nesta venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Produto</TableHead>
                      <TableHead className="text-center w-20">Qtd</TableHead>
                      <TableHead className="text-right w-28">Preço Unit.</TableHead>
                      <TableHead className="text-right w-28">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item, index) => (
                      <TableRow key={index} className="border-b">
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{item.product.title}</div>
                            <div className="text-xs text-gray-500">
                              Código: {item.product.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium py-3">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right py-3 text-sm">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-semibold py-3 text-sm">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-3 space-y-1 border-t pt-3 bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(sale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(sale.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => window.print()}>
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}