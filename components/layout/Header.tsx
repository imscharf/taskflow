// taskflow/components/layout/Header.tsx (Atualizado)
"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, CalendarDays, LayoutDashboard } from "lucide-react"; // Importa LayoutDashboard para o Kanban

export function Header() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout. Tente novamente.");
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        TaskFlow
      </Link>
      <nav className="flex items-center space-x-4">
        {loading ? (
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        ) : (
          <>
            {currentUser ? (
              // Se o usuário estiver logado
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/calendar" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Calendário">
                  <CalendarDays className="h-6 w-6 text-gray-700" />
                </Link>
                <Link href="/kanban" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Quadro Kanban">
                  <LayoutDashboard className="h-6 w-6 text-gray-700" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Sair"
                >
                  <LogOut className="h-6 w-6 text-gray-700" />
                </button>
              </>
            ) : (
              // Se o usuário não estiver logado
              <Link href="/login" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Login">
                <UserIcon className="h-6 w-6 text-gray-700" />
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}