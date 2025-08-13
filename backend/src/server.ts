import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

import productRoutes from "../routes/products-route";
import categoryRoutes from "../routes/category-route";
import saleRoutes from "../routes/sales-route";
import dashboardRoutes from "../routes/dashboard-route";
import authRoutes from "../routes/auth-routes";
import { requireAuth } from "..//middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.use("/api/products", requireAuth, productRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/sales", requireAuth, saleRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);



app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Inventory Management API",
    version: "1.0.0",
  });
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    name: "Inventory Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      sales: "/api/sales",
      dashboard: "/api/dashboard",
    },
    documentation: {
      health: "GET /health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        verify: "GET /api/auth/verify",
        logout: "POST /api/auth/logout",
        changePassword: "POST /api/auth/change-password",
        users: "GET /api/auth/users (Admin only)",
      },
      products: {
        list: "GET /api/products",
        create: "POST /api/products",
        getById: "GET /api/products/:id",
        getByCode: "GET /api/products/code/:code",
        update: "PUT /api/products/:id",
        delete: "DELETE /api/products/:id",
        updateStock: "PATCH /api/products/:id/stock",
        lowStock: "GET /api/products/low-stock",
      },
      categories: {
        list: "GET /api/categories",
        create: "POST /api/categories",
        getById: "GET /api/categories/:id",
        update: "PUT /api/categories/:id",
        delete: "DELETE /api/categories/:id",
      },
      sales: {
        list: "GET /api/sales",
        create: "POST /api/sales",
        getById: "GET /api/sales/:id",
        getByCode: "GET /api/sales/code/:code",
        updateStatus: "PATCH /api/sales/:id/status",
        cancel: "PATCH /api/sales/:id/cancel",
        report: "GET /api/sales/report",
      },
      dashboard: {
        getData: "GET /api/dashboard",
        getKPIs: "GET /api/dashboard/kpis",
        refresh: "POST /api/dashboard/refresh"
      }
    },
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Algo deu errado!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro interno do servidor",
  });
});

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard`);
});