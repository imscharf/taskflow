// taskflow/components/layout/Navbar.tsx (Atualizado com ThemeToggle)
"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, CalendarDays, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "../ui/ThemeToggle"; // Importa ThemeToggle

export function Navbar() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout. Tente novamente.");
    }
  };

  const navLinks = (
    <>
      {currentUser ? (
        <>
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium" onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/calendar" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium" onClick={() => setIsMenuOpen(false)}>
            Calendário
          </Link>
          <Link href="/kanban" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium" onClick={() => setIsMenuOpen(false)}>
            Kanban
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center"
          >
            <LogOut className="h-5 w-5 mr-2" /> Sair
          </button>
        </>
      ) : (
        <Link href="/login" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium" onClick={() => setIsMenuOpen(false)}>
          Login / Cadastro
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center relative z-40">
      <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        TaskFlow
      </Link>

      {/* Menu Desktop */}
      <nav className="hidden md:flex items-center space-x-4">
        {loading ? (
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        ) : (
          <>
            {currentUser ? (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Dashboard
                </Link>
                <Link href="/calendar" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" aria-label="Calendário">
                  <CalendarDays className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </Link>
                <Link href="/kanban" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" aria-label="Quadro Kanban">
                  <LayoutDashboard className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </Link>
                <ThemeToggle /> {/* Botão de alternar tema */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  aria-label="Sair"
                >
                  <LogOut className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
              </>
            ) : (
              <>
                <ThemeToggle /> {/* Botão de alternar tema */}
                <Link href="/login" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" aria-label="Login">
                  <UserIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {/* Botão de Menu Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle /> {/* Botão de alternar tema no mobile também */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
          <div className="flex flex-col py-2">
            {navLinks}
          </div>
        </div>
      )}
    </header>
  );
}