// taskflow/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, CalendarDays, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";

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
          <Link href="/dashboard" className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent font-medium rounded-md" onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/calendar" className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent font-medium rounded-md" onClick={() => setIsMenuOpen(false)}>
            Calendário
          </Link>
          <Link href="/kanban" className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent font-medium rounded-md" onClick={() => setIsMenuOpen(false)}>
            Kanban
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-foreground hover:text-primary hover:bg-accent font-medium flex items-center rounded-md"
          >
            <LogOut className="h-5 w-5 mr-2" /> Sair
          </button>
        </>
      ) : (
        <Link href="/login" className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent font-medium rounded-md" onClick={() => setIsMenuOpen(false)}>
          Login / Cadastro
        </Link>
      )}
    </>
  );

  return (
    // ALTERAÇÃO: Removido backdrop-blur e opacidade. Agora é bg-background sólido.
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 container mx-auto">
        
        <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
          TaskFlow
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center space-x-2">
          {loading ? (
            <div className="w-6 h-6 bg-muted rounded-full animate-pulse"></div>
          ) : (
            <>
              {currentUser ? (
                <>
                  <Link href="/dashboard" className="text-foreground hover:text-primary font-medium px-3 py-2 rounded-md transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/calendar" className="p-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors duration-200" aria-label="Calendário">
                    <CalendarDays className="h-5 w-5" />
                  </Link>
                  <Link href="/kanban" className="p-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors duration-200" aria-label="Quadro Kanban">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-foreground hover:bg-accent hover:text-destructive transition-colors duration-200"
                    aria-label="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/login" className="p-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors duration-200" aria-label="Login">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Botão Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-foreground hover:bg-accent hover:text-primary focus:outline-none">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg md:hidden">
          <div className="flex flex-col py-2 px-4 space-y-1">
            {navLinks}
          </div>
        </div>
      )}
    </header>
  );
}