"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskPriority } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { useState } from "react";

const taskFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().optional(),
  dueDate: z.string().min(1, "A data de vencimento é obrigatória."),
  priority: z.nativeEnum(TaskPriority, {
    message: "A prioridade é obrigatória.",
  }),
  subtasks: z.string().optional(),
});

type TaskFormInputs = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onTaskAdded?: () => void;
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const { addTask, loading: addingTask, error: addError } = useTasks();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormInputs>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      priority: TaskPriority.MEDIUM,
      dueDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: TaskFormInputs) => {
    setError(null);
    try {
      const subtasksTitles = data.subtasks ? data.subtasks.split(',').map(s => s.trim()).filter(Boolean) : [];
      await addTask(
        data.title,
        data.description || "",
        data.dueDate,
        data.priority,
        subtasksTitles
      );
      reset();
      onTaskAdded?.();
    } catch (err: any) {
      console.error("Erro ao adicionar tarefa:", err);
      setError(addError || "Erro ao adicionar tarefa. Tente novamente.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 border border-border rounded-lg shadow-lg bg-card text-card-foreground">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Adicionar Nova Tarefa</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">Título</label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
          />
          {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">Descrição (Opcional)</label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">Data de Vencimento</label>
          <input
            id="dueDate"
            type="date"
            {...register("dueDate")}
            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
          />
          {errors.dueDate && <p className="mt-1 text-sm text-destructive">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground">Prioridade</label>
          <select
            id="priority"
            {...register("priority")}
            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
          >
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.priority && <p className="mt-1 text-sm text-destructive">{errors.priority.message}</p>}
        </div>

        <div>
          <label htmlFor="subtasks" className="block text-sm font-medium text-foreground">Sub-tarefas (separar por vírgula, opcional)</label>
          <input
            id="subtasks"
            type="text"
            placeholder="Ex: Fazer pesquisa, Comprar materiais"
            {...register("subtasks")}
            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
          />
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <button
          type="submit"
          disabled={addingTask}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {addingTask ? "Adicionando..." : "Adicionar Tarefa"}
        </button>
      </form>
    </div>
  );
}