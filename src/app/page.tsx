// taskflow/app/page.tsx (Atualizado com inspiração Aceternity UI)
"use client";

import Link from "next/link";
import { motion } from "framer-motion"; // Para animações

// Você pode criar componentes Aceternity UI aqui, por exemplo, um botão com efeito.
// Por enquanto, farei um "Hero Section" estilizado com Tailwind e Framer Motion.

export default function HomePage() {
  return (
    <div className="relative w-full h-[calc(100vh-theme(spacing.24))] flex flex-col items-center justify-center bg-black overflow-hidden py-20 md:py-0">
      {/* Background animado ou efeito de luz (Spotlight da Aceternity) */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(147, 197, 253, 0.15), transparent 70%)" }}></div>

      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 py-4 max-w-4xl"
      >
        Organize sua vida com{" "}
        <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">TaskFlow</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl text-center"
      >
        A ferramenta definitiva para você gerenciar projetos, acompanhar seu progresso e alcançar seus objetivos com facilidade.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 mt-8"
      >
        <Link href="/signup">
          <button className="px-8 py-3 rounded-full bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition-colors duration-300 shadow-xl border border-transparent hover:border-blue-500">
            Comece Agora!
          </button>
        </Link>
      </motion.div>

      {/* Exemplo de componente Aceternity UI, como um efeito de "meteor" ou "bento grid" */}
      {/* <Meteors number={20} /> */} {/* Se você tiver o componente Meteors da Aceternity UI */}
    </div>
  );
}