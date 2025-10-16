import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useProductExport } from "@/hooks/export/product-export";
import type { Product } from "@/types/product-types";

interface ExportButtonsProps {
  selectedProducts: Product[];
  allProductsSelected: number;
  disabled?: boolean;
  onExportComplete?: () => void;
}

export function ExportButtons({
  selectedProducts,
  allProductsSelected,
  disabled = false,
  onExportComplete,
}: ExportButtonsProps) {
  const { exportLoading, exportAllProducts, exportSelectedProducts } =
    useProductExport();

  const handleExportAll = async () => {
    const result = await exportAllProducts();
    if (result.success && onExportComplete) {
      onExportComplete();
    }
  };

  const handleExportSelected = async () => {
    const result = await exportSelectedProducts(selectedProducts);
    if (result.success && onExportComplete) {
      onExportComplete();
    }
  };

  return (
    <>
      {allProductsSelected > 0 && (
        <Button
          variant="outline"
          onClick={handleExportSelected}
          disabled={disabled || exportLoading}
        >
          {exportLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 mr-2" />
          )}
          Exportar Selecionados ({allProductsSelected})
        </Button>
      )}

      <Button
        variant="outline"
        onClick={handleExportAll}
        disabled={disabled || exportLoading}
      >
        {exportLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Exportar Todos
      </Button>
    </>
  );
}
