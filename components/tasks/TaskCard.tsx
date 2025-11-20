// taskflow/components/tasks/TaskCard.tsx
"use client";

import { Task, Subtask, TaskPriority } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { useState } from "react";
import { CheckCircle2, Circle, Edit, Trash, Calendar, Tag, AlertCircle, Loader2 } from "lucide-react";
import { ProgressCircle } from "@tremor/react"; // Importar componente de progresso Tremor
import Link from "next/link";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void; // Callback para quando a tarefa for deletada (opcional)
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState<string | null>(null); // ID da subtask sendo atualizada

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-300";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "A Fazer":
        return "bg-blue-100 text-blue-800";
      case "Fazendo":
        return "bg-orange-100 text-orange-800";
      case "Concluído":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    setIsUpdatingSubtask(subtaskId);
    try {
      const updatedSubtasks = task.subtasks.map((sub) =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      );
      await updateTask(task.id, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error("Erro ao atualizar sub-tarefa:", error);
      alert("Erro ao atualizar sub-tarefa.");
    } finally {
      setIsUpdatingSubtask(null);
    }
  };

  const handleDeleteTask = async () => {
    if (confirm(`Tem certeza que deseja deletar a tarefa "${task.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
        onDelete?.(task.id);
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        alert("Erro ao deletar tarefa.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Concluído";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex-grow mr-4">{task.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
            <Tag className="inline-block w-3 h-3 mr-1" />{task.priority}
          </span>
          {/* Botão de Editar agora linka para a página de detalhes */}
          <Link href={`/tasks/${task.id}`} passHref>
            <button
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Ver Detalhes/Editar Tarefa"
            >
              <Edit className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <button
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
            aria-label="Deletar Tarefa"
          >
            {isDeleting ? <Loader2 className="h-5 w-5 text-red-600 animate-spin" /> : <Trash className="h-5 w-5 text-red-600" />}
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 flex-grow">{task.description}</p>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4 mr-2" />
        <span>Data de Vencimento: {new Date(task.dueDate).toLocaleDateString()}</span>
        {isOverdue && (
          <span className="ml-3 flex items-center text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 mr-1" /> Atrasada!
          </span>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Sub-tarefas:</h4>
          <ul className="space-y-2">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id} className="flex items-center text-gray-600 text-sm">
                <button
                  onClick={() => handleToggleSubtask(subtask.id)}
                  disabled={isUpdatingSubtask === subtask.id}
                  className="mr-2 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  aria-label={subtask.completed ? "Desmarcar sub-tarefa" : "Marcar sub-tarefa"}
                >
                  {isUpdatingSubtask === subtask.id ? (
                     <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : subtask.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <span className={subtask.completed ? "line-through text-gray-400" : ""}>
                  {subtask.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Progresso:</span>
        <ProgressCircle
          value={task.progress}
          size="md"
          strokeWidth={8}
          className="ml-2"
          color={task.progress === 100 ? "emerald" : "blue"}
        >
          <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
        </ProgressCircle>
      </div>
    </div>
  );
}