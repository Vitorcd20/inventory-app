import { ExportButtons } from "@/components/export/export-products-buttons";
import { LoadingAndAlertWrapper } from "@/components/loading/loading-alert";
import { ConfirmAndCancelModal } from "@/components/modals/confirm-cancel-modal";
import { CreateProductModal } from "@/components/modals/create-product-modal";
import { EditProductModal } from "@/components/modals/edit-product-modal";
import { SearchBar } from "@/components/search/search-bar";
import { ProductsTable } from "@/components/table/products-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/hooks/products/products";
import { API_BASE_URL } from "@/utils/app-utils";
import { Plus } from "lucide-react";

export function Products() {
  const {
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    fetchProducts,
    
    selectedProducts,
    toggleProduct,
    toggleAll,
    handleExportComplete,
    
    createModalOpen,
    setCreateModalOpen,
    handleProductCreated,
    categories,
    loadingCategories,
    submitCreate,
    resetCreateForm,
    registerCreate,
    handleSubmitCreate,
    createFormState,
    watchCreate,
    setCreateValue,
    
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
    handleProductUpdated,
    
    confirmationState,
    handleDeleteClick,
    handleConfirmAction,
    handleCancelAction,
  } = useProducts();

  return (
    <Card className="bg-white rounded-lg shadow-sm border min-h-[90vh] w-full h-full px-[200px] py-[120px] mt-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Pesquisar produtos..."
        selectedCount={selectedProducts.size}
        disabled={loading}
        actions={
          <>
            <ExportButtons
              selectedProducts={Array.from(selectedProducts).map(id => 
                products.find(p => p.id === id)!
              ).filter(Boolean)}
              allProductsSelected={selectedProducts.size}
              disabled={loading}
              onExportComplete={handleExportComplete}
            />
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </>
        }
      />

      <ConfirmAndCancelModal
        open={confirmationState.open}
        onOpenChange={(open) => !open && handleCancelAction()}
        onConfirm={handleConfirmAction}
        loading={confirmationState.loading}
        title="Excluir Produto"
        description={`Você tem certeza que deseja excluir o produto "${confirmationState.productTitle}"? Esta ação não pode ser desfeita e o produto será removido permanentemente do sistema.`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="cancel"
      />

      <LoadingAndAlertWrapper
        loading={loading}
        error={error}
        loadingMessage="Carregando produtos..."
        errorDetails={`Verifique se o backend está rodando em: ${API_BASE_URL}`}
      >
        <ProductsTable
          products={products}
          selectedProducts={selectedProducts}
          searchTerm={searchTerm}
          deleteLoading={confirmationState.loading}
          onToggleProduct={toggleProduct}
          onToggleAll={toggleAll}
          onDeleteClick={handleDeleteClick}
          onEditClick={(product) => {
            setProductToEdit(product);
            setEditModalOpen(true);
          }}
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(searchTerm, currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => fetchProducts(searchTerm, page)}
                  disabled={loading}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(searchTerm, currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        )}
      </LoadingAndAlertWrapper>

      <CreateProductModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onProductCreated={handleProductCreated}
        registerCreate={registerCreate}
        handleSubmitCreate={handleSubmitCreate}
        createFormState={createFormState}
        watchCreate={watchCreate}
        setCreateValue={setCreateValue}
        resetCreateForm={resetCreateForm}
        categories={categories}
        loadingCategories={loadingCategories}
        submitCreate={submitCreate}
      />
      
      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={productToEdit}
        onProductUpdated={handleProductUpdated}
      />
    </Card>
  );
}