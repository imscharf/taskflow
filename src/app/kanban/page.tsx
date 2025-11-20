"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTasks } from "../../../hooks/useTasks";
import { Task } from "../../../types";
import { TaskModal } from "../../../components/tasks/TaskModal";
import { Loader2, Edit, Trash } from "lucide-react";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const KANBAN_COLUMNS = {
  "A Fazer": "A Fazer",
  "Fazendo": "Fazendo",
  "Concluído": "Concluído",
};

type ColumnId = keyof typeof KANBAN_COLUMNS;

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDeleting: boolean;
}

function SortableTaskCard({ task, onEdit, onDelete, isDeleting }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "A Fazer":
        return "border-l-4 border-l-blue-500";
      case "Fazendo":
        return "border-l-4 border-l-orange-500";
      case "Concluído":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card text-card-foreground rounded-lg shadow-sm p-4 mb-3 border border-border cursor-grab active:cursor-grabbing
                  ${getStatusColor(task.status)}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-foreground text-lg grow mr-2 wrap-break-word">{task.title}</h4>
        <div className="flex space-x-1 shrink-0">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(task)}
            className="p-1 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            aria-label="Editar Tarefa"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 disabled:opacity-50"
            aria-label="Deletar Tarefa"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 text-destructive animate-spin" /> : <Trash className="h-4 w-4 text-destructive" />}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
      <p className="text-xs text-muted-foreground mt-2">Vencimento: {new Date(task.dueDate).toLocaleDateString()}</p>
      <div className="text-xs font-medium text-foreground mt-2">Progresso: {task.progress}%</div>
    </div>
  );
}

export default function KanbanPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, updateTask, deleteTask } = useTasks();
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDelete = async (taskId: string) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      setIsDeletingTask(taskId);
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Erro ao deletar tarefa no Kanban:", error);
        alert("Erro ao deletar tarefa.");
      } finally {
        setIsDeletingTask(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id.toString();

    const newStatus = over.id.toString() as Task["status"];
    if (Object.values(KANBAN_COLUMNS).includes(newStatus)) {
      const task = tasks.find(t => t.id === activeId);
      if (task && task.status !== newStatus) {
        try {
          await updateTask(activeId, { status: newStatus });
        } catch (error) {
          console.error("Erro ao atualizar status da tarefa:", error);
          alert("Erro ao mover tarefa.");
        }
      }
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-(--spacing(24)))] bg-background">
        <p className="text-xl text-muted-foreground">Carregando Kanban...</p>
      </div>
    );
  }

  const tasksByStatus = Object.values(KANBAN_COLUMNS).reduce((acc, status) => {
    acc[status as ColumnId] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<ColumnId, Task[]>);

  return (
    <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background transition-colors duration-300">
      <h1 className="text-4xl font-bold text-foreground mb-6">Quadro Kanban</h1>
      <p className="text-xl text-muted-foreground mb-8">Arraste e solte tarefas para gerenciar seu fluxo de trabalho.</p>

      {tasksLoading && <p className="text-center text-muted-foreground">Carregando tarefas do Kanban...</p>}
      {tasksError && <p className="text-center text-destructive">{tasksError}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(KANBAN_COLUMNS).map(([columnId, columnName]) => (
            <div key={columnId} className="bg-muted/30 border border-border rounded-lg p-4 shadow-sm min-h-[400px]">
              <h2 className="text-xl font-bold text-foreground mb-4 flex justify-between items-center">
                {columnName}
                <span className="text-sm font-medium bg-background text-foreground border border-border px-2 py-0.5 rounded-full">
                  {tasksByStatus[columnId as ColumnId]?.length || 0}
                </span>
              </h2>
              <SortableContext items={tasksByStatus[columnId as ColumnId] || []} strategy={verticalListSortingStrategy}>
                <div id={columnId} className="space-y-3 min-h-[200px]">
                  {tasksByStatus[columnId as ColumnId]?.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={setSelectedTask}
                      onDelete={handleDelete}
                      isDeleting={isDeletingTask === task.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}