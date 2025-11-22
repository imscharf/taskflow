"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative w-full min-h-[calc(90vh-4.5rem)] flex flex-col items-center justify-center bg-background overflow-hidden px-4">
      
      {/* Efeitos de Fundo (Blobs de luz) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Luz Azul (Topo Esquerda) */}
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px]" />
        
        {/* Luz Roxa (Baixo Direita) */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Badge "Novidade" (Opcional, visual moderno) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-accent/50 border border-border mb-6 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v1.0 Disponível
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6"
        >
          Gerencie suas tarefas com <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Inteligência e Foco
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          O TaskFlow une simplicidade e poder. Organize projetos, acompanhe prazos e aumente sua produtividade com nossa metodologia intuitiva.
        </motion.p>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-input bg-background text-foreground font-medium text-lg hover:bg-accent hover:text-accent-foreground transition-all">
              Já tenho conta
            </button>
          </Link>
        </motion.div>

        {/* Feature Highlights (Pequena lista abaixo dos botões) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Gratuito para sempre
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Quadro Kanban
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Dashboard em tempo real
          </div>
        </motion.div>
      </div>
    </div>
  );
}