// taskflow/components/tasks/TaskList.tsx (Atualizado)
"use client";

import { useTasks } from "../../hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { Loader2 } from "lucide-react";

export function TaskList() {
  const { tasks, loading, error } = useTasks();
  // const [editingTask, setEditingTask] = useState<Task | null>(null); // Removido

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">Carregando suas tarefas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 text-lg">
        <p>{error}</p>
        <p>Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">Você não tem nenhuma tarefa ainda.</p>
        <p className="text-md text-gray-500 mt-2">Use o formulário acima para adicionar sua primeira tarefa!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          // onEdit removido
          // onDelete pode ser tratado diretamente pelo TaskCard ou passar um handler
        />
      ))}
      {/* TaskModal removido */}
    </div>
  );
}