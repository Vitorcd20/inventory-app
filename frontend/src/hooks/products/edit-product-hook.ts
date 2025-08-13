/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_BASE_URL } from '@/utils/app-utils'
import { editProductSchema, type EditProductFormData } from '@/schemas/product-schema'
import { useAuthenticatedFetch } from '@/hooks/auth/auth'
import { toast } from 'sonner'

const handleApiErrors = async (response: Response, setError: any) => {
  try {
    const errorData = await response.json()
    
    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach((err: any) => {
        if (err.path) {
          setError(err.path, { message: err.msg })
        }
      })
      return
    }
    
    throw new Error(errorData.message || errorData.error || 'Erro ao atualizar produto')
  } catch {
    throw new Error('Erro ao processar resposta do servidor')
  }
}

export const useUpdateProduct = (productId: string | null, onSuccess: () => void) => {
  const authenticatedFetch = useAuthenticatedFetch()
  
  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      title: '',
      description: '',
      categoryId: '',
      quantity: 0,
      unitPrice: 0,
      salePrice: 0,
      minStock: 0,
    }
  })

  const submitUpdate = async (data: EditProductFormData) => {
    if (!productId) {
      toast.error('Erro interno', {
        description: 'ID do produto não encontrado',
        duration: 4000,
      })
      return
    }

    try {
      console.log('Atualizando produto:', productId, data)

      const response = await authenticatedFetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })

      if (!response) {
        console.error('Erro de autenticação ao atualizar produto')
        toast.error('Erro de autenticação', {
          description: 'Você precisa estar logado para atualizar produtos',
          duration: 4000,
        })
        return
      }

      if (!response.ok) {
        await handleApiErrors(response, form.setError)
        return
      }

      const result = await response.json()
      console.log('Produto atualizado:', result.message)
      
      toast.success('Produto atualizado com sucesso!', {
        description: 'As alterações foram salvas no sistema.',
        duration: 4000,
      })
      
      onSuccess()
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar produto'
      
      form.setError('root', {
        message: errorMessage
      })
      
      toast.error('Erro ao atualizar produto', {
        description: errorMessage,
        duration: 4000,
      })
    }
  }

  return {
    ...form,
    submitUpdate
  }
}