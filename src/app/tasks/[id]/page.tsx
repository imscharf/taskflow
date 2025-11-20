"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { TaskModal } from "../../../../components/tasks/TaskModal";
import { Task } from "../../../../types";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

interface TaskDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskFetchError, setTaskFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser && taskId) {
      const fetchSpecificTask = async () => {
        setLoadingTask(true);
        setTaskFetchError(null);
        try {
          const docRef = doc(db, "tasks", taskId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as any;
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
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : Date.now(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : Date.now(),
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
      <div className="flex justify-center items-center min-h-[calc(100vh-(--spacing(24)))] bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-3 text-xl text-muted-foreground">Carregando detalhes...</p>
      </div>
    );
  }

  if (taskFetchError) {
    return (
      <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background flex items-center justify-center">
        <p className="text-xl text-destructive">{taskFetchError}</p>
        <button onClick={() => router.push("/dashboard")} className="ml-4 text-primary hover:underline">Voltar</button>
      </div>
    );
  }

  if (!taskDetails) return null;

  return (
    <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background flex justify-center items-start">
      <TaskModal
        task={taskDetails}
        isOpen={true}
        onClose={() => router.push("/dashboard")}
      />
    </div>
  );
}