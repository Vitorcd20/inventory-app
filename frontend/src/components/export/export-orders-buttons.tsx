import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useSalesExport } from "@/hooks/export/sales-export";
import type { Sale } from "@/types/sale-types";

interface SalesExportButtonsProps {
  selectedSales: Sale[];
  allSalesSelected: number;
  disabled?: boolean;
  onExportComplete?: () => void;
}

export function SalesExportButtons({ 
  selectedSales, 
  allSalesSelected, 
  disabled = false,
  onExportComplete 
}: SalesExportButtonsProps) {
  const { exportLoading, exportAllSales, exportSelectedSales } = useSalesExport();

  const handleExportAll = async () => {
    const result = await exportAllSales();
    if (result.success && onExportComplete) {
      onExportComplete();
    }
  };

  const handleExportSelected = async () => {
    const result = await exportSelectedSales(selectedSales);
    if (result.success && onExportComplete) {
      onExportComplete();
    }
  };

  return (
    <>
      {allSalesSelected > 0 && (
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
          Exportar Selecionadas ({allSalesSelected})
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
        Exportar Todas
      </Button>
    </>
  );
}