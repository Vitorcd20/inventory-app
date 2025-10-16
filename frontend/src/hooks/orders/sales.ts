import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { API_BASE_URL } from '@/utils/app-utils'
import { useAuth, useAuthenticatedFetch } from '../auth/auth'
import type { Product } from '@/types/product-types'

const saleSchema = z.object({
  productCode: z.string().min(1, 'Código do produto é obrigatório'),
  customer: z.string().min(1, 'Nome do cliente é obrigatório'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
})

type SaleFormData = z.infer<typeof saleSchema>

export function useSale(onSaleCompleted: () => void) {
  const [product, setProduct] = useState<Product | null>(null)
  const [searchingProduct, setSearchingProduct] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isAuthenticated } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()

  const authenticatedFetchRef = useRef(authenticatedFetch)
  authenticatedFetchRef.current = authenticatedFetch

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productCode: '',
      customer: '',
      quantity: 1,
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, watch, setError, clearErrors } = form
  const [productCode, quantity] = watch(['productCode', 'quantity'])

  const generateSaleCode = useCallback((): string => {
    const now = new Date()
    const timestamp = now.getTime().toString().slice(-6) 
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `VND${timestamp}${random}`
  }, [])

  const resetForm = useCallback(() => {
    reset({
      productCode: '',
      customer: '',
      quantity: 1,
    })
    setProduct(null)
    clearErrors()
  }, [reset, clearErrors])

  const formatCurrency = useCallback((value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }, [])

  const searchProduct = useCallback(async (code: string) => {
    if (!isAuthenticated) {
      console.warn('Usuário não autenticado, não é possível buscar produtos')
      return
    }

    if (code.trim().length < 2) {
      setProduct(null)
      clearErrors('productCode')
      return
    }

    try {
      setSearchingProduct(true)
      
      const response = await authenticatedFetchRef.current(`${API_BASE_URL}/products`)
      
      if (!response) {
        setError('root', { 
          type: 'manual', 
          message: 'Erro de autenticação. Faça login novamente.' 
        })
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const foundProduct = data.products?.find((p: Product) => 
          p.code.toLowerCase() === code.toLowerCase().trim()
        )
        
        if (foundProduct) {
          console.log('Produto encontrado:', foundProduct.title)
          setProduct(foundProduct)
          clearErrors('productCode')
        } else {
          setProduct(null)
          if (code.trim().length >= 3) {
            setError('productCode', { 
              type: 'manual', 
              message: 'Produto não encontrado' 
            })
          }
        }
      } else {
        setProduct(null)
        setError('root', { 
          type: 'manual', 
          message: 'Erro ao buscar produtos' 
        })
      }
    } catch (err) {
      console.error('Erro ao buscar produto:', err)
      setError('root', { 
        type: 'manual', 
        message: 'Erro ao conectar com o servidor' 
      })
      setProduct(null)
    } finally {
      setSearchingProduct(false)
    }
  }, [isAuthenticated, setError, clearErrors])

  useEffect(() => {
    if (isAuthenticated && productCode && productCode.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchProduct(productCode)
      }, 500)
      return () => clearTimeout(debounceTimer)
    } else if (productCode && productCode.trim().length < 2) {
      setProduct(null)
      clearErrors('productCode')
    }
  }, [productCode, isAuthenticated])

  useEffect(() => {
    if (product && quantity > 0) {
      if (quantity > product.quantity) {
        setError('quantity', {
          type: 'manual',
          message: `Estoque insuficiente. Disponível: ${product.quantity}`
        })
      } else if (errors.quantity?.type === 'manual') {
        clearErrors('quantity')
      }
    }
  }, [product, quantity, setError, clearErrors, errors.quantity?.type])

  const submitSale = useCallback(async (data: SaleFormData) => {
    if (!isAuthenticated) {
      setError('root', { 
        type: 'manual', 
        message: 'Você precisa estar logado para realizar vendas' 
      })
      return
    }

    if (!product) {
      setError('productCode', { 
        type: 'manual', 
        message: 'Produto não encontrado' 
      })
      return
    }

    if (data.quantity > product.quantity) {
      setError('quantity', {
        type: 'manual',
        message: `Estoque insuficiente. Disponível: ${product.quantity}`
      })
      return
    }

    try {
      setIsSubmitting(true)

      const saleData: SaleData = {
        code: generateSaleCode(),
        customer: data.customer.trim(),
        items: [{
          productId: product.id,
          quantity: data.quantity
        }],
        discount: 0
      }

      console.log('Enviando dados da venda:', saleData)

      const response = await authenticatedFetchRef.current(`${API_BASE_URL}/sales`, {
        method: 'POST',
        body: JSON.stringify(saleData),
      })

      if (!response) {
        setError('root', {
          type: 'manual',
          message: 'Erro de autenticação. Faça login novamente.'
        })
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Erro ao processar venda')
      }

      const result = await response.json()
      console.log('Venda realizada:', result)
      
      resetForm()
      onSaleCompleted()
      
    } catch (err) {
      console.error('Erro ao processar venda:', err)
      setError('root', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Erro ao processar venda'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [isAuthenticated, product, generateSaleCode, setError, onSaleCompleted, resetForm])

  const isStockLow = product && product.quantity <= product.minStock
  const hasInsufficientStock = product && quantity > 0 && quantity > product.quantity
  const totalValue = product && quantity > 0 ? product.salePrice * quantity : 0

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
    watch,
    submitSale,

    product,
    searchingProduct,

    isStockLow,
    hasInsufficientStock,
    totalValue,

    formatCurrency,

    isAuthenticated,
  }
}