import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiResponse, Product } from "@/types/product-types";
import { API_BASE_URL } from "@/utils/app-utils";
import {
  createProductSchema,
  type CreateProductFormData,
} from "@/schemas/product-schema";
import { useAuth, useAuthenticatedFetch } from "../auth/auth";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
};

interface ConfirmationState {
  open: boolean;
  type: 'delete';
  productId?: string;
  productTitle?: string;
  loading: boolean;
}

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    open: false,
    type: 'delete',
    loading: false,
  });

  const { isAuthenticated } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const authenticatedFetchRef = useRef(authenticatedFetch);
  authenticatedFetchRef.current = authenticatedFetch;

  const products = allProducts.filter(product => product.isActive !== false);

  const createForm = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      code: "",
      title: "",
      categoryId: "",
      quantity: 0,
      unitPrice: 0,
      salePrice: 0,
      minStock: 0,
    },
  });

  const createFormRef = useRef(createForm);
  createFormRef.current = createForm;

  const fetchProducts = useCallback(
    async (search: string = "", page: number = 1) => {
      if (!isAuthenticated) {
        console.warn("Usuário não autenticado");
        setError("Você precisa estar logado para acessar os produtos");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (search && search.trim()) {
          params.append("search", search.trim());
        }

        const response = await authenticatedFetchRef.current(
          `${API_BASE_URL}/products?${params}`
        );

        if (!response) {
          console.error("Erro de autenticação ao carregar produtos");
          setError("Erro de autenticação. Redirecionando para login...");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro na resposta:", errorData);
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        setAllProducts(data.products || []);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos";
        setError(errorMessage);
        console.error("Erro ao buscar produtos:", err);
        
        if (!errorMessage.includes("autenticação")) {
          toast.error("Erro ao carregar produtos", {
            description: errorMessage,
            duration: 4000,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("Usuário não autenticado, pulando carregamento de categorias");
      return;
    }

    try {
      setLoadingCategories(true);

      const response = await authenticatedFetchRef.current(
        `${API_BASE_URL}/categories`
      );

      if (!response) {
        console.error("Erro de autenticação ao carregar categorias");
        toast.error("Erro de autenticação", {
          description: "Não foi possível carregar as categorias. Faça login novamente.",
          duration: 4000,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setCategories(
        data.categories?.filter((cat: Category) => cat.isActive) || []
      );
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      const errorMessage = "Erro ao carregar categorias. Tente novamente.";
      
      createFormRef.current.setError("root", {
        message: errorMessage,
      });

      toast.error("Erro ao carregar categorias", {
        description: error instanceof Error ? error.message : errorMessage,
        duration: 4000,
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [isAuthenticated]);

  const toggleProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => {
      const copy = new Set(prev);
      copy.has(productId) ? copy.delete(productId) : copy.add(productId);
      return copy;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedProducts((prev) =>
      prev.size === products.length
        ? new Set()
        : new Set(products.map((p) => p.id))
    );
  }, [products]);

  const handleExportComplete = useCallback(() => {
    setSelectedProducts(new Set());
  }, []);

  const createProduct = useCallback(
    async (data: CreateProductFormData) => {
      if (!isAuthenticated) {
        const errorMessage = "Você precisa estar logado para criar produtos";
        toast.error("Erro de autenticação", {
          description: errorMessage,
          duration: 4000,
        });
        throw new Error(errorMessage);
      }

      try {
        console.log("Criando produto:", data.title);

        const response = await authenticatedFetchRef.current(
          `${API_BASE_URL}/products`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        if (!response) {
          const errorMessage = "Erro de autenticação ao criar produto";
          toast.error("Erro de autenticação", {
            description: errorMessage,
            duration: 4000,
          });
          throw new Error(errorMessage);
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || `Erro ${response.status}: ${response.statusText}`;
          
          toast.error("Erro ao criar produto", {
            description: errorMessage,
            duration: 4000,
          });
          
          throw new Error(errorMessage);
        }

        console.log("Produto criado com sucesso");

        toast.success('Produto criado com sucesso!', {
          description: 'O novo produto foi adicionado ao sistema.',
          duration: 4000,
        });

        await fetchProducts(searchTerm, currentPage);
        createFormRef.current.reset();

        return true;
      } catch (error) {
        console.error("Erro ao criar produto:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar produto";

        createFormRef.current.setError("root", {
          message: errorMessage,
        });

        throw error;
      }
    },
    [isAuthenticated, fetchProducts, searchTerm, currentPage]
  );

  const submitCreate = useCallback(
    async (data: CreateProductFormData) => {
      try {
        await createProduct(data);
      } catch (error) {
        // Erro já foi tratado em createProduct
        // Não precisa fazer nada aqui
      }
    },
    [createProduct]
  );

  const resetCreateForm = useCallback(() => {
    createFormRef.current.reset();
    createFormRef.current.clearErrors();
  }, []);

  const handleProductCreated = useCallback(() => {
    console.log('Callback de produto criado - apenas fechando modal');

    setCreateModalOpen(false);
  }, []);

  const handleProductUpdated = useCallback(() => {
    fetchProducts(searchTerm, currentPage);
  }, [fetchProducts, searchTerm, currentPage]);

  const handleDeleteClick = useCallback((product: Product) => {
    setConfirmationState({
      open: true,
      type: 'delete',
      productId: product.id,
      productTitle: product.title,
      loading: false,
    });
  }, []);

  const executeDelete = useCallback(async (productId: string) => {
    const deleteUrl = `${API_BASE_URL}/products/${productId}`;
    
    try {
      setConfirmationState(prev => ({ ...prev, loading: true }));
      
      const product = products.find(p => p.id === productId);
      console.log('Deletando produto:', product?.title);
      
      const response = await authenticatedFetchRef.current(deleteUrl, {
        method: "DELETE",
      });

      if (!response) {
        console.error('Erro de autenticação ao deletar produto');
        toast.error('Erro de autenticação ao deletar produto');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar produto');
      }

      const result = await response.json();

      await fetchProducts(searchTerm, currentPage);

      setSelectedProducts((prev) => {
        const copy = new Set(prev);
        copy.delete(productId);
        return copy;
      });

      if (result.message?.includes('desativado')) {
        toast.success('Produto removido com sucesso!', {
          description: 'O produto foi desativado e não aparecerá mais na listagem.',
          duration: 4000,
        });
      } else {
        toast.success('Produto excluído com sucesso!', {
          description: 'O produto foi removido permanentemente do sistema.',
          duration: 4000,
        });
      }

    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao excluir produto', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 4000,
      });
    } finally {
      setConfirmationState({
        open: false,
        type: 'delete',
        loading: false,
      });
    }
  }, [products, fetchProducts, searchTerm, currentPage]);

  const handleConfirmAction = useCallback(async () => {
    if (confirmationState.type === 'delete' && confirmationState.productId) {
      await executeDelete(confirmationState.productId);
    }
  }, [confirmationState, executeDelete]);

  const handleCancelAction = useCallback(() => {
    setConfirmationState({
      open: false,
      type: 'delete',
      loading: false,
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        fetchProducts(searchTerm, 1);
        setCurrentPage(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, isAuthenticated, fetchProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, loadCategories]);

  return {
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
    registerCreate: createForm.register,
    handleSubmitCreate: createForm.handleSubmit,
    createFormState: createForm.formState,
    watchCreate: createForm.watch,
    setCreateValue: createForm.setValue,
    clearCreateErrors: createForm.clearErrors,
    
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
    handleProductUpdated,
    
    confirmationState,
    handleDeleteClick,
    handleConfirmAction,
    handleCancelAction,
  };
};