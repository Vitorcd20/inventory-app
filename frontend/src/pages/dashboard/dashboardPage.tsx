import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Dashboard from './dashboard'
import { API_BASE_URL } from '@/utils/app-utils'
import type { DashboardData } from '@/types/sale-types'


interface SaleFromAPI {
  id: string
  code: string
  customer: string
  totalValue: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED'
  date: string 
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || localStorage.getItem('token')
  }
  
  // Opção 2: sessionStorage
  // return sessionStorage.getItem('authToken')
  
  // Opção 3: cookies (se usando next-auth ou similar)
  // return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || null
  
  return null
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
            
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.')
      }
      
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        throw new Error(`Erro: ${response.status} - ${response.statusText}`)
      }

      const dashboardData = await response.json()
      const dataWithDates: DashboardData = {
        ...dashboardData,
        recentSales: dashboardData.recentSales?.map((sale: SaleFromAPI) => ({
          ...sale,
          date: new Date(sale.date)
        })) || []
      }

      setData(dataWithDates)
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 text-lg">Carregando dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Buscando dados do banco</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-3">Erro ao carregar dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          <div className="space-y-3">
            <Button onClick={fetchDashboardData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            {error.includes('Token') && (
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="outline" 
                className="w-full"
              >
                Ir para Login
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado disponível</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-4">
            Recarregar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-gray-50 px-4 py-2 border-b">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </span>
          <Button 
            onClick={fetchDashboardData} 
            variant="ghost" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Dashboard data={data} />
    </div>
  )
}

export default DashboardPage