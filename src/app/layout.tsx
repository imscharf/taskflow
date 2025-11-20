// taskflow/app/layout.tsx (Atualizado com Sonner Toaster)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../context/AuthContext";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import Script from "next/script";
import { ThemeProvider } from "../../components/providers/ThemeProvider";
import { Toaster } from "sonner"; // Importa Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Gerenciador de Tarefas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthProvider>
          <Toaster richColors position="bottom-right" /> {/* Adiciona o Toaster */}
        </ThemeProvider>
        <div data-vw="true" className="enabled">
          <div vw-access-button="true" className="active"></div>
          <div vw-plugin-wrapper="true">
            <div className="vw-plugin-top-wrapper"></div>
          </div>
        </div>
        <Script src="https://vlibras.gov.br/app/vlibras-plugin.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}