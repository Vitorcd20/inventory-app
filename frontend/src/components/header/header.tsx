import { Bell, Menu, Search, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/auth/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarExpanded: boolean;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    const roleMap = {
      USER: "Usuário",
      ADMIN: "Admin",
      MANAGER: "Gerente",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full">
        <div
          className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
          onClick={onMenuClick}
        >
          <Menu />
        </div>

        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {getUserInitials(user.name)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
