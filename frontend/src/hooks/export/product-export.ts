import { useState } from 'react';
import { exportToExcel } from '@/utils/excel-export';
import { useToast } from '@/hooks/export/toast';
import { API_BASE_URL } from '@/utils/app-utils';
import type { Product } from '@/types/product-types';
import { useAuthenticatedFetch } from '../auth/auth';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}

export function useProductExport() {
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();
    const authenticatedFetch = useAuthenticatedFetch(); 


  const transformProductData = (products: Product[]) => {
    return products.map((product) => ({
      'ID': product.id,
      'Nome': product.title,
      'Descrição': product.description || '',
      'Preço Unit': product.unitPrice,
      'Preço': product.salePrice,
      'Categoria': product.category?.name || '',
      'Estoque': product.quantity || 0,
      'Codigo do produto': product.code || '',
      'Status': product.isActive ? 'Ativo' : 'Inativo',
      'Data de Criação': product.createdAt 
        ? new Date(product.createdAt).toLocaleDateString('pt-BR')
        : '',
    }));
  };

  const exportAllProducts = async (options: ExportOptions = {}) => {
    try {
      setExportLoading(true);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/products?limit=10000`);
      
      
      if (!response) {
        throw new Error('Falha na autenticação');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Invalid response format');
      }

      const exportData = transformProductData(data.products);

      const result = exportToExcel(exportData, {
        filename: options.filename || 'produtos_completo',
        sheetName: options.sheetName || 'Lista de Produtos',
        includeTimestamp: options.includeTimestamp ?? true
      });

      if (result.success) {
        toast({
          title: "Exportação concluída!",
          description: `${result.recordCount} produtos exportados para ${result.filename}`,
        });
        return { success: true, count: result.recordCount };
      } else {
        throw new Error(result.error || 'Erro na exportação');
      }
      
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
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

  const exportSelectedProducts = async (
    selectedProducts: Product[],
    options: ExportOptions = {}
  ) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para exportar",
        variant: "destructive",
      });
      return { success: false, error: 'No products selected' };
    }

    try {
      setExportLoading(true);
      
      const exportData = transformProductData(selectedProducts);

      const result = exportToExcel(exportData, {
        filename: options.filename || 'produtos_selecionados',
        sheetName: options.sheetName || 'Produtos Selecionados',
        includeTimestamp: options.includeTimestamp ?? true
      });

      if (result.success) {
        toast({
          title: "Exportação concluída!",
          description: `${result.recordCount} produtos selecionados exportados para ${result.filename}`,
        });
        return { success: true, count: result.recordCount };
      } else {
        throw new Error(result.error || 'Erro na exportação');
      }
      
    } catch (error) {
      console.error('Erro ao exportar produtos selecionados:', error);
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
    exportAllProducts,
    exportSelectedProducts,
  };
}