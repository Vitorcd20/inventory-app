import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleDollarSign, Check } from "lucide-react";
import { useState } from "react";
import { SaleModal } from "@/components/modals/sale-order-modal";
import { OrdersTable } from "@/components/table/order.table";
import { LoadingAndAlertWrapper } from "@/components/loading/loading-alert";
import { API_BASE_URL } from "@/utils/app-utils";
import type { Sale } from "@/types/sale-types";
import { SalesFilters } from "./order-filters";
import { useSales } from "@/hooks/orders/orders";
import { SalesExportButtons } from "@/components/export/export-orders-buttons";
import { SaleDetailsModal } from "@/components/modals/sale-details-modal";
import { toast } from "sonner";
import { ConfirmAndCancelModal } from "@/components/modals/confirm-cancel-modal";

export function Orders() {
  const {
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
    modalData,
  } = useSales();

  const [openSaleModal, setOpenSaleModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleSaleCompleted = () => {
    fetchSales();
    toast.success("Venda criada com sucesso!", {
      description: "A nova venda foi adicionada ao sistema",
      duration: 4000,
    });
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsModalOpen(true);
  };

  const handleExportComplete = () => {
    setSelectedSales(new Set());
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow-sm border min-h-[90vh] w-full h-full px-[200px] py-[120px] mt-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Vendas</h1>
          <div className="flex gap-3">
            {selectedPendingSales.length > 0 && (
              <Button
                onClick={handleBulkConfirmRequest}
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar {selectedPendingSales.length} Venda(s)
              </Button>
            )}

            <SalesExportButtons
              selectedSales={selectedSalesData}
              allSalesSelected={selectedSales.size}
              disabled={loading}
              onExportComplete={handleExportComplete}
            />

            <Button onClick={() => setOpenSaleModal(true)}>
              <CircleDollarSign className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </div>
        </div>

        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          onRefresh={fetchSales}
          loading={loading}
        />

        <SaleDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          sale={selectedSale}
        />

        <ConfirmAndCancelModal
          open={confirmationState.open}
          onOpenChange={(open) => !open && handleCancelAction()}
          onConfirm={handleConfirmAction}
          loading={confirmationState.loading}
          {...modalData}
        />

        <LoadingAndAlertWrapper
          loading={loading}
          error={error}
          loadingMessage="Carregando vendas..."
          errorDetails={`Verifique se o backend está rodando em: ${API_BASE_URL}`}
        >
          <OrdersTable
            sales={sales}
            selectedSales={selectedSales}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            dateFilter={dateFilter}
            loading={loading}
            error={error}
            onToggleSale={toggleSale}
            onToggleAll={toggleAll}
            onViewDetails={handleViewDetails}
            onStatusUpdate={handleStatusUpdateRequest}
            onCancelSale={handleCancelSaleRequest}
            updatingStatus={updatingStatus}
            cancelingStatus={cancelingStatus}
          />
        </LoadingAndAlertWrapper>
      </Card>

      <SaleModal
        open={openSaleModal}
        onOpenChange={setOpenSaleModal}
        onSaleCompleted={handleSaleCompleted}
      />
    </>
  );
}