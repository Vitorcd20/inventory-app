import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/header/header";
import { Sidebar } from "./components/sidebar/sidebar";
import type { MenuItemType } from "./types/menu";
import { Products } from "./pages/products/products";
import { Orders } from "./pages/orders/orders";
import DashboardPage from "./pages/dashboard/dashboardPage";
import { AuthProvider } from "./hooks/auth/auth";
import { ProtectedApp } from "./components/auth/protected-app";
import { Toaster } from "sonner";

function MainApp() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveMenuItem = (): MenuItemType => {
    switch (location.pathname) {
      case "/products":
        return "Produtos";
      case "/orders":
        return "Vendas";
      case "/":
      case "/dashboard":
        return "Dashboard";
      default:
        return "Dashboard";
    }
  };

  const toggleSidebar = (): void => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleMenuItemChange = (item: MenuItemType): void => {
    switch (item) {
      case "Produtos":
        navigate("/products");
        break;
      case "Vendas":
        navigate("/orders");
        break;
      case "Dashboard":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onMenuClick={toggleSidebar}
        isSidebarExpanded={isSidebarExpanded}
      />
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        activeItem={getActiveMenuItem()}
        onItemChange={handleMenuItemChange}
      />
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarExpanded ? "ml-64" : "ml-16"
        } p-6`}
      >
        <div className="w-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp>
        <MainApp />
        <Toaster position="top-right" richColors />
      </ProtectedApp>
    </AuthProvider>
  );
}