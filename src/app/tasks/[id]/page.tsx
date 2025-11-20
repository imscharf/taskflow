// taskflow/app/tasks/[id]/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TaskModal } from "../../../../components/tasks/TaskModal"; // Reutiliza o modal para exibir/editar
import { useTasks } from "../../../../hooks/useTasks";
import { Task } from "../../../../types";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

interface TaskDetailsPageProps {
  params: {
    id: string; // O ID da tarefa virá dos parâmetros da URL
  };
}

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(); // Para ter acesso à lista atualizada
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskFetchError, setTaskFetchError] = useState<string | null>(null);

  const taskId = params.id;

  // Redireciona se o usuário não estiver logado
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  // Busca a tarefa específica se ela não estiver no `useTasks` hook ou para garantir que é a mais recente
  useEffect(() => {
    if (currentUser && taskId) {
      const fetchSpecificTask = async () => {
        setLoadingTask(true);
        setTaskFetchError(null);
        try {
          const docRef = doc(db, "tasks", taskId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // Mapeia o documento do Firestore para o tipo Task
            const data = docSnap.data() as any; // Usar 'any' temporariamente, idealmente mapear com `mapFirestoreDocToTask`
            setTaskDetails({
              id: docSnap.id,
              userId: data.userId,
              title: data.title,
              description: data.description,
              dueDate: data.dueDate,
              priority: data.priority,
              status: data.status,
              subtasks: data.subtasks || [],
              progress: data.progress || 0,
              createdAt: data.createdAt?.toDate().getTime() || Date.now(),
              updatedAt: data.updatedAt?.toDate().getTime() || Date.now(),
            });
          } else {
            setTaskFetchError("Tarefa não encontrada.");
          }
        } catch (error) {
          console.error("Erro ao buscar detalhes da tarefa:", error);
          setTaskFetchError("Erro ao carregar detalhes da tarefa.");
        } finally {
          setLoadingTask(false);
        }
      };
      fetchSpecificTask();
    }
  }, [currentUser, taskId]);


  if (authLoading || loadingTask || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.24))]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-xl text-gray-700">Carregando detalhes da tarefa...</p>
      </div>
    );
  }

  if (taskFetchError) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-red-600">{taskFetchError}</p>
      </div>
    );
  }

  if (!taskDetails) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Tarefa não disponível.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50 flex justify-center items-start">
      {/* Reutiliza o TaskModal para exibir e editar a tarefa */}
      {/* O TaskModal já possui o botão de fechar, então ele se comportará como uma página modal */}
      <TaskModal
        task={taskDetails}
        isOpen={true} // Sempre aberto quando nesta página
        onClose={() => router.push("/dashboard")} // Ao fechar, volta para o dashboard
      />
    </div>
  );
}