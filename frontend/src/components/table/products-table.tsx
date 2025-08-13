import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trash2, Pencil } from 'lucide-react'
import { formatCurrency, formatDate } from '@/pages/products/utils'
import type { Product } from '@/types/product-types'
import { API_BASE_URL } from '@/utils/app-utils'
import { translateCategory } from './utils'

interface ProductsTableProps {
  products: Product[]
  selectedProducts: Set<string>
  searchTerm: string
  deleteLoading: boolean
  onToggleProduct: (productId: string) => void
  onToggleAll: () => void
  onDeleteClick: (product: Product) => void
  onEditClick: (product: Product) => void
}

export function ProductsTable({
  products,
  selectedProducts,
  searchTerm,
  deleteLoading,
  onToggleProduct,
  onToggleAll,
  onDeleteClick,
  onEditClick
}: ProductsTableProps) {
  
  const handleDeleteClick = (product: Product) => {
    onDeleteClick(product);
  };

  const getStockBadgeVariant = (quantity: number, minStock: number): "default" | "secondary" | "destructive" => {
    if (quantity === 0) return 'destructive'
    if (quantity <= minStock) return 'secondary'
    return 'default'
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedProducts.size === products.length &&
                  products.length > 0
                }
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Preço Unit.</TableHead>
            <TableHead>Preço Venda</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-gray-500"
              >
                {searchTerm
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto cadastrado"}
                <br />
                <small className="text-xs">
                  API: {API_BASE_URL}/products
                </small>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => onToggleProduct(product.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {product.code}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.title}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {product.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {translateCategory(product.category.name)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStockBadgeVariant(
                        product.quantity,
                        product.minStock
                      )}
                    >
                      {product.quantity}
                    </Badge>
                    {product.quantity <= product.minStock && (
                      <span className="text-xs text-red-500">
                        (Min: {product.minStock})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(product.salePrice)}
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      disabled={deleteLoading}
                      title="Excluir produto"
                      className={deleteLoading ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(product)}
                      title="Editar produto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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