import { Header } from '@/components/header/header';
import { Sidebar } from '@/components/sidebar/sidebar';
import { useState, type JSX } from 'react';

export function HomePage(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleMenuClick = (): void => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onMenuClick={handleMenuClick} isSidebarExpanded={false} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={handleSidebarClose} 
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Home Page</h1>
          <p className="text-gray-600">Conteúdo da sua página inicial aqui.</p>
        </div>
      </main>
    </div>
  );
}