"use client";

import { Task } from "../../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void; // Nova prop para recarregar dados
}

export function TaskList({ tasks, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-xl text-muted-foreground">Você não tem nenhuma tarefa ainda.</p>
        <p className="text-md text-muted-foreground/80 mt-2">Use o formulário acima para adicionar sua primeira tarefa!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          // Quando o card deletar, ele chama essa função que avisa o pai
          onDelete={() => onUpdate()} 
        />
      ))}
    </div>
  );
}