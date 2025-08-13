import { useState } from 'react';
import {  useAuthenticatedFetch } from '../auth/auth';
import { exportToExcel } from '@/utils/excel-export';
import { useToast } from '@/hooks/export/toast';
import { API_BASE_URL } from '@/utils/app-utils';
import type { Sale } from '@/types/sale-types';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}

export function useSalesExport() {
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch(); 

  const transformSalesData = (sales: Sale[]) => {
    return sales.map((sale) => ({
      'ID': sale.id,
      'Código': sale.code || '',
      'Cliente': sale.customer || '',
      'Status': getStatusLabel(sale.status),
      'Total': sale.totalValue,
      'Desconto': sale.discount || 0,
      'Total Final': sale.totalValue || sale.totalValue,
    }));
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'CANCELLED': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const exportAllSales = async (options: ExportOptions = {}) => {
    try {
      setExportLoading(true);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/sales?limit=10000`);
      
      if (!response) {
        throw new Error('Falha na autenticação');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.sales || !Array.isArray(data.sales)) {
        throw new Error('Invalid response format');
      }

      const exportData = transformSalesData(data.sales);

      const result = exportToExcel(exportData, {
        filename: options.filename || 'vendas_completo',
        sheetName: options.sheetName || 'Lista de Vendas',
        includeTimestamp: options.includeTimestamp ?? true
      });

      if (result.success) {
        toast({
          title: "Exportação concluída!",
          description: `${result.recordCount} vendas exportadas para ${result.filename}`,
        });
        return { success: true, count: result.recordCount };
      } else {
        throw new Error(result.error || 'Erro na exportação');
      }
      
    } catch (error) {
      console.error('Erro ao exportar vendas:', error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setExportLoading(false);
    }
  };

  const exportSelectedSales = async (
    selectedSales: Sale[],
    options: ExportOptions = {}
  ) => {
    if (selectedSales.length === 0) {
      toast({
        title: "Nenhuma venda selecionada",
        description: "Selecione pelo menos uma venda para exportar",
        variant: "destructive",
      });
      return { success: false, error: 'No sales selected' };
    }

    try {
      setExportLoading(true);
      
      const exportData = transformSalesData(selectedSales);

      const result = exportToExcel(exportData, {
        filename: options.filename || 'vendas_selecionadas',
        sheetName: options.sheetName || 'Vendas Selecionadas',
        includeTimestamp: options.includeTimestamp ?? true
      });

      if (result.success) {
        toast({
          title: "Exportação concluída!",
          description: `${result.recordCount} vendas selecionadas exportadas para ${result.filename}`,
        });
        return { success: true, count: result.recordCount };
      } else {
        throw new Error(result.error || 'Erro na exportação');
      }
      
    } catch (error) {
      console.error('Erro ao exportar vendas selecionadas:', error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setExportLoading(false);
    }
  };

  return {
    exportLoading,
    exportAllSales,
    exportSelectedSales,
  };
}