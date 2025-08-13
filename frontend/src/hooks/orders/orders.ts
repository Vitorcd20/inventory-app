import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "@/utils/app-utils";
import type { Sale } from "@/types/sale-types";
import { useAuth, useAuthenticatedFetch } from "../auth/auth";
import { toast } from "sonner";

type SalesApiResponse = {
  sales: Sale[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

interface ConfirmationState {
  open: boolean;
  type: 'confirm' | 'cancel' | 'bulk-confirm';
  saleId?: string;
  saleCode?: string;
  loading: boolean;
  bulkCount?: number;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());

  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [cancelingStatus, setCancelingStatus] = useState<Set<string>>(new Set());
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    open: false,
    type: 'confirm',
    loading: false,
  });

  const { isAuthenticated, token } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const authenticatedFetchRef = useRef(authenticatedFetch);
  authenticatedFetchRef.current = authenticatedFetch;

  const fetchSales = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("Usuário não autenticado");
      setError("Você precisa estar logado para acessar as vendas");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (searchTerm && searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (dateFilter && dateFilter.trim()) {
        params.append("date", dateFilter.trim());
      }

      const url = `${API_BASE_URL}/sales?${params.toString()}`;

      const manualResponse = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!manualResponse.ok) {
        const errorData = await manualResponse.json();
        console.error("Erro na resposta:", errorData);
        throw new Error(
          `Erro ${manualResponse.status}: ${manualResponse.statusText}`
        );
      }

      const data: SalesApiResponse = await manualResponse.json();

      setSales(data.sales || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar vendas";
      setError(errorMessage);
      console.error("Erro ao buscar vendas:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchTerm, statusFilter, dateFilter, token]);

  const toggleSale = useCallback((saleId: string) => {
    setSelectedSales((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedSales((prev) => {
      return prev.size === sales.length
        ? new Set()
        : new Set(sales.map((s) => s.id));
    });
  }, [sales]);

  const executeStatusUpdate = useCallback(async (saleId: string, newStatus: string) => {
    setUpdatingStatus((prev) => new Set(prev).add(saleId));

    try {
      console.log("Atualizando status da venda:", saleId, "para:", newStatus);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/sales/${saleId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response) {
        console.error("Erro de autenticação ao atualizar status");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha ao atualizar status da venda"
        );
      }

      const result = await response.json();
      console.log("Status atualizado:", result);

      await fetchSales();

      toast.success("Status atualizado!", {
        description: `Venda ${
          newStatus === "CONFIRMED" ? "confirmada" : "atualizada"
        } com sucesso`,
        duration: 4000,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error(
        `Erro ao atualizar status: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }
  }, [authenticatedFetch, fetchSales]);

  const executeCancelSale = useCallback(async (saleId: string) => {
    setCancelingStatus(prev => new Set(prev).add(saleId));
    
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/sales/${saleId}/cancel`,
        {
          method: 'PATCH', 
        }
      );

      if (!response) {
        console.error("Erro de autenticação ao cancelar venda");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Erro ao cancelar venda');
      }

      const result = await response.json();
      console.log("Venda cancelada:", result);

      await fetchSales();

      toast.success('Venda cancelada com sucesso!', {
        description: 'O estoque dos produtos foi restituído.',
        duration: 4000,
      });
    } catch (err) {
      console.error("Erro ao cancelar venda:", err);
      toast.error(err instanceof Error ? err.message : 'Erro ao cancelar venda');
    } finally {
      setCancelingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }
  }, [authenticatedFetch, fetchSales]);

  const executeBulkConfirm = useCallback(async () => {
    const pendingSales = sales.filter(
      (sale) => selectedSales.has(sale.id) && sale.status === "PENDING"
    );

    const promises = pendingSales.map((sale) =>
      executeStatusUpdate(sale.id, "CONFIRMED")
    );

    await Promise.all(promises);
    setSelectedSales(new Set());
  }, [sales, selectedSales, executeStatusUpdate]);

  const handleStatusUpdateRequest = useCallback((saleId: string, newStatus: string) => {
    const sale = sales.find(s => s.id === saleId);
    
    if (newStatus === 'CONFIRMED') {
      setConfirmationState({
        open: true,
        type: 'confirm',
        saleId,
        saleCode: sale?.code,
        loading: false,
      });
    }
  }, [sales]);

  const handleCancelSaleRequest = useCallback((saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    
    setConfirmationState({
      open: true,
      type: 'cancel',
      saleId,
      saleCode: sale?.code,
      loading: false,
    });
  }, [sales]);

  const handleBulkConfirmRequest = useCallback(() => {
    const pendingSales = sales.filter(
      (sale) => selectedSales.has(sale.id) && sale.status === "PENDING"
    );

    if (pendingSales.length === 0) {
      toast.warning("Nenhuma venda pendente selecionada");
      return;
    }

    setConfirmationState({
      open: true,
      type: 'bulk-confirm',
      loading: false,
      bulkCount: pendingSales.length,
    });
  }, [sales, selectedSales]);

  const handleConfirmAction = useCallback(async () => {
    setConfirmationState(prev => ({ ...prev, loading: true }));

    try {
      if (confirmationState.type === 'confirm' && confirmationState.saleId) {
        await executeStatusUpdate(confirmationState.saleId, 'CONFIRMED');
      } else if (confirmationState.type === 'cancel' && confirmationState.saleId) {
        await executeCancelSale(confirmationState.saleId);
      } else if (confirmationState.type === 'bulk-confirm') {
        await executeBulkConfirm();
      }
    } finally {
      setConfirmationState({
        open: false,
        type: 'confirm',
        loading: false,
      });
    }
  }, [confirmationState, executeStatusUpdate, executeCancelSale, executeBulkConfirm]);

  const handleCancelAction = useCallback(() => {
    setConfirmationState({
      open: false,
      type: 'confirm',
      loading: false,
    });
  }, []);

  const getModalData = useCallback(() => {
    switch (confirmationState.type) {
      case 'confirm':
        return {
          title: "Confirmar Venda",
          description: `Você tem certeza que deseja confirmar a venda ${confirmationState.saleCode}? Esta ação não pode ser desfeita.`,
          confirmText: "Sim, Confirmar",
          cancelText: "Cancelar",
          variant: "confirm" as const,
        };
      case 'cancel':
        return {
          title: "Cancelar Venda",
          description: `Você tem certeza que deseja cancelar a venda ${confirmationState.saleCode}? O estoque dos produtos será restituído e esta ação não pode ser desfeita.`,
          confirmText: "Sim, Cancelar Venda",
          cancelText: "Não, Manter Venda",
          variant: "cancel" as const,
        };
      case 'bulk-confirm':
        return {
          title: "Confirmar Vendas em Lote",
          description: `Você tem certeza que deseja confirmar ${confirmationState.bulkCount} venda(s) selecionada(s)? Esta ação não pode ser desfeita.`,
          confirmText: `Sim, Confirmar ${confirmationState.bulkCount} Venda(s)`,
          cancelText: "Cancelar",
          variant: "confirm" as const,
        };
      default:
        return {
          title: "",
          description: "",
          confirmText: "Confirmar",
          cancelText: "Cancelar",
          variant: "confirm" as const,
        };
    }
  }, [confirmationState]);

  const selectedSalesData = sales.filter((sale) => selectedSales.has(sale.id));
  const selectedPendingSales = selectedSalesData.filter(
    (sale) => sale.status === "PENDING"
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated, fetchSales]);

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        fetchSales();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, dateFilter, isAuthenticated, fetchSales]);

  return {
    sales,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    selectedSales,
    setSelectedSales,
    
    fetchSales,
    toggleSale,
    toggleAll,
    
    updatingStatus,
    cancelingStatus,
    confirmationState,
    
    handleStatusUpdateRequest,
    handleCancelSaleRequest,
    handleBulkConfirmRequest,
    handleConfirmAction,
    handleCancelAction,
    
    selectedSalesData,
    selectedPendingSales,
    modalData: getModalData(),
  };
};