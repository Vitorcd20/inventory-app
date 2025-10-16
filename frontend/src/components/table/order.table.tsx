import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, RefreshCw, Check, Loader2, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/pages/products/utils'
import type { Sale } from '@/types/sale-types'

interface OrdersTableProps {
  sales: Sale[]
  selectedSales: Set<string>
  searchTerm: string
  statusFilter: string
  dateFilter: string
  loading: boolean
  error: string | null
  onToggleSale: (saleId: string) => void
  onToggleAll: () => void
  onViewDetails: (sale: Sale) => void
  onStatusUpdate?: (saleId: string, newStatus: string) => void
  onCancelSale?: (saleId: string) => void
  updatingStatus?: Set<string>
  cancelingStatus?: Set<string>
}

export function OrdersTable({
  sales,
  selectedSales,
  searchTerm,
  statusFilter,
  dateFilter,
  loading,
  error,
  onToggleSale,
  onToggleAll,
  onViewDetails,
  onStatusUpdate,
  onCancelSale,
  updatingStatus = new Set(),
  cancelingStatus = new Set(),
}: OrdersTableProps) {

  const getTotalItems = (sale: Sale): number => {
    return sale.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendente' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Confirmado' },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelado' },
      DELIVERED: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Entregue' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const canConfirm = (status: string) => status === 'PENDING'
  const canCancel = (status: string) => status === 'PENDING' || status === 'CONFIRMED'

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedSales.size === sales.length &&
                  sales.length > 0
                }
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead>Código da Venda</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Carregando vendas...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                {searchTerm || (statusFilter !== 'all') || (dateFilter !== 'all')
                  ? "Nenhuma venda encontrada com os filtros aplicados"
                  : "Nenhuma venda cadastrada"
                }
                <br />
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedSales.has(sale.id)}
                    onCheckedChange={() => onToggleSale(sale.id)}
                  />
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {sale.code}
                </TableCell>
                <TableCell>
                  {formatDate(sale.date)}
                </TableCell>
                <TableCell className="font-medium">
                  {sale.customer}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{getTotalItems(sale)} itens</span>
                    <span className="text-xs text-gray-500">
                      {sale.items.map(item => `${item.product.title} (${item.quantity}x)`).join(', ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(sale.totalValue)}
                    </span>
                    {sale.discount > 0 && (
                      <span className="text-xs text-gray-500">
                        Desc: {formatCurrency(sale.discount)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(sale.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(sale)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {canConfirm(sale.status) && onStatusUpdate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusUpdate(sale.id, 'CONFIRMED')}
                        disabled={updatingStatus.has(sale.id)}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        title="Confirmar venda"
                      >
                        {updatingStatus.has(sale.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {canCancel(sale.status) && onCancelSale && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancelSale(sale.id)}
                        disabled={cancelingStatus.has(sale.id)}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        title="Cancelar venda"
                      >
                        {cancelingStatus.has(sale.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}