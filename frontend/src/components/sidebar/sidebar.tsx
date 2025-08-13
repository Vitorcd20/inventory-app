import type { MenuItemType } from '@/types/menu';
import { type ReactNode } from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeItem: MenuItemType;
  onItemChange: (item: MenuItemType) => void;
}

interface MenuItem {
  name: MenuItemType;
  icon: ReactNode;
}

export function Sidebar({ isExpanded, activeItem, onItemChange }: SidebarProps) {

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      )
    },
    {
      name: 'Produtos',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      name: 'Vendas',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      )
    },
  ];

  const handleItemClick = (itemName: MenuItemType): void => {
    onItemChange(itemName); 
  };
  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-800 z-40 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >

      <nav className="p-2 pt-4">
        <div className="space-y-2">
          {menuItems.map((item: MenuItem) => (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.name)}
              className={`w-full flex items-center transition-all duration-200 rounded-lg group relative ${
                isExpanded 
                  ? 'p-3 justify-start' 
                  : 'p-3 justify-center'
              } ${
                activeItem === item.name
                  ? 'bg-opacity-20'
                  : 'text-purple-100 hover:bg-opacity-10'
              }`}
              title={!isExpanded ? item.name : ''}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              
              {isExpanded && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {!isExpanded && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
