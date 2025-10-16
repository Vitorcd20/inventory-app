import { translateCategory } from "@/components/table/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader,CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/pages/products/utils";
import type { DashboardData } from "@/types/sale-types";
import {Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, DollarSign, Package, PieChart, ShoppingCart, Target } from "lucide-react";
import { useNavigate } from "react-router";

interface DashboardProps {
  data: DashboardData;
}

const calculateTodaySales = (recentSales: DashboardData["recentSales"]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  return recentSales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return (
      saleDate >= today && saleDate <= todayEnd && sale.status === "CONFIRMED"
    );
  }).length;
};

const calculateYesterdaySales = (recentSales: DashboardData["recentSales"]) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  return recentSales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return (
      saleDate >= yesterday &&
      saleDate <= yesterdayEnd &&
      sale.status === "CONFIRMED"
    );
  }).length;
};
const calculateSalesGrowth = (todaySales: number, yesterdaySales: number) => {
  if (yesterdaySales === 0) {
    return todaySales > 0 ? 100 : 0;
  }
  return ((todaySales - yesterdaySales) / yesterdaySales) * 100;
};

export default function Dashboard({ data }: DashboardProps) {
  const navigate = useNavigate();
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
      CONFIRMED: { color: "bg-green-100 text-green-800", label: "Confirmado" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelado" },
      DELIVERED: { color: "bg-blue-100 text-blue-800", label: "Entregue" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando dados do dashboard...</p>
      </div>
    );
  }

  const {
    kpis = {
      totalSales: 0,
      salesGrowth: 0,
      totalRevenue: 0,
      revenueGrowth: 0,
      totalProducts: 0,
      totalCustomers: 0,
      lowStockProducts: 0,
      pendingOrders: 0,
    },
    recentSales = [],
    topProducts = [],
    lowStockProducts = [],
    salesByCategory = [],
  } = data;

  const todaySales = calculateTodaySales(recentSales);
  const yesterdaySales = calculateYesterdaySales(recentSales);
  const actualSalesGrowth = calculateSalesGrowth(todaySales, yesterdaySales);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        :
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-bold">{todaySales}</p>
                <div className="flex items-center gap-1 text-sm">
                  {actualSalesGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : actualSalesGrowth < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={
                      actualSalesGrowth > 0
                        ? "text-green-500"
                        : actualSalesGrowth < 0
                        ? "text-red-500"
                        : "text-gray-500"
                    }
                  >
                    {actualSalesGrowth === 0
                      ? "0%"
                      : `${Math.abs(actualSalesGrowth).toFixed(1)}%`}
                  </span>
                  <span className="text-gray-500">
                    vs. ontem ({yesterdaySales})
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold">{kpis.totalSales}</p>
                <p className="text-sm text-gray-500">Vendas confirmadas</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(kpis.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {kpis.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      kpis.revenueGrowth > 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {Math.abs(kpis.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-gray-500">vs. mês anterior</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos</p>
                <p className="text-2xl font-bold">{kpis.totalProducts}</p>
                <p className="text-sm text-gray-500">Total cadastrados</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">Produtos com Estoque Baixo</p>
                <p className="text-sm text-gray-600">
                  {kpis.lowStockProducts} produtos precisam de reposição
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Ver Todos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Pedidos Pendentes</p>
                <p className="text-sm text-gray-600">
                  {kpis.pendingOrders} pedidos aguardando confirmação
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => navigate("/orders?status=pending")}
              >
                Revisar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vendas Recentes
            </CardTitle>
            <CardDescription>Últimas 5 vendas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.length > 0 ? (
                  recentSales.slice(0, 5).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.code}
                      </TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{formatCurrency(sale.totalValue)}</TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      Nenhuma venda recente encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/orders")}
              >
                Ver Todas as Vendas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Produtos
            </CardTitle>
            <CardDescription>Produtos mais vendidos este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {translateCategory(product.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {product.sold} vendas
                      </p>
                      <p className="text-xs text-green-600">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum produto vendido ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Estoque Crítico
            </CardTitle>
            <CardDescription>
              Produtos que precisam de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => {
                  const percentage = Math.min(
                    (product.quantity / product.minStock) * 100,
                    100
                  );

                  return (
                    <div key={product.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{product.title}</p>
                          <p className="text-xs text-gray-500">
                            {product.category.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.quantity}/{product.minStock}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Todos os produtos estão com estoque adequado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Vendas por Categoria
            </CardTitle>
            <CardDescription>Distribuição de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesByCategory.length > 0 ? (
                salesByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{translateCategory(category.category)}</span>
                      <span className="font-medium">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <p className="text-xs text-gray-500 text-right">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma venda por categoria ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
