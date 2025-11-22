"use client";

import { Task, TaskPriority } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { useState } from "react";
import { CheckCircle2, Circle, Edit, Trash, Calendar, Tag, AlertCircle, Loader2 } from "lucide-react";
import { ProgressCircle } from "@tremor/react";
import Link from "next/link";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState<string | null>(null);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-black border-red-300 dark:bg-red-700/30 dark:text-red-200 dark:border-red-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-200 dark:border-yellow-800";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-700/30 dark:text-green-200 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "A Fazer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200";
      case "Fazendo":
        return "bg-orange-100 text-orange-800 dark:bg-orange-700/30 dark:text-orange-200";
      case "Concluído":
        return "bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-green-900";
      default:
        return "bg-muted text-muted-foreground";
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
      toast.error("Erro ao atualizar sub-tarefa.");
    } finally {
      setIsUpdatingSubtask(null);
    }
  };

  const handleDeleteTask = () => {
    toast("Excluir Tarefa?", {
      description: `Tem certeza que deseja remover "${task.title}"? Essa ação não pode ser desfeita.`,
      action: {
        label: "Excluir",
        onClick: async () => {
          setIsDeleting(true);
          try {
            await deleteTask(task.id);
            onDelete?.(task.id);
            toast.success("Tarefa removida com sucesso!");
          } catch (error) {
            console.error("Erro ao deletar tarefa:", error);
            toast.error("Erro ao deletar tarefa.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
        } 
      },
      actionButtonStyle: {
        backgroundColor: "#ef4444",
        color: "white",
      },
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Concluído";

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold grow mr-4 wrap-break-word">{task.title}</h3>
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
            <Tag className="inline-block w-3 h-3 mr-1" />{task.priority}
          </span>
          <Link href={`/tasks/${task.id}`} passHref>
            <button
              className="p-1 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              aria-label="Ver Detalhes/Editar Tarefa"
            >
              <Edit className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </Link>
          <button
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 disabled:opacity-50"
            aria-label="Deletar Tarefa"
          >
            {isDeleting ? <Loader2 className="h-5 w-5 text-destructive animate-spin" /> : <Trash className="h-5 w-5 text-destructive" />}
          </button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4 grow whitespace-pre-wrap">{task.description}</p>

      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Calendar className="w-4 h-4 mr-2" />
        <span>Vencimento: {new Date(task.dueDate).toLocaleDateString()}</span>
        {isOverdue && (
          <span className="ml-3 flex items-center text-destructive font-medium">
            <AlertCircle className="w-4 h-4 mr-1" /> Atrasada!
          </span>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium text-foreground mb-2">Sub-tarefas:</h4>
          <ul className="space-y-2">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id} className="flex items-center text-sm">
                <button
                  onClick={() => handleToggleSubtask(subtask.id)}
                  disabled={isUpdatingSubtask === subtask.id}
                  className="mr-2 p-1 rounded-full hover:bg-accent disabled:opacity-50"
                >
                  {isUpdatingSubtask === subtask.id ? (
                     <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : subtask.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <span className={subtask.completed ? "line-through text-muted-foreground" : "text-foreground"}>
                  {subtask.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Progresso:</span>
        <ProgressCircle
          value={task.progress}
          size="md"
          strokeWidth={8}
          className="ml-2"
          color={task.progress === 100 ? "emerald" : "blue"}
        >
          <span className="text-xs font-medium text-foreground">{task.progress}%</span>
        </ProgressCircle>
      </div>
    </div>
  );
}