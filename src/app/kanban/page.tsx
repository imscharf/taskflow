// taskflow/app/kanban/page.tsx
"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTasks } from "../../../hooks/useTasks";
import { Task } from "../../../types";
import { TaskModal } from "../../../components/tasks/TaskModal";
import { Loader2, Edit, Trash, Plus } from "lucide-react";

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
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Definir as colunas do Kanban
const KANBAN_COLUMNS = {
  "A Fazer": "A Fazer",
  "Fazendo": "Fazendo",
  "Concluído": "Concluído",
};

type ColumnId = keyof typeof KANBAN_COLUMNS;

// Componente para um item arrastável (Task Card simplificado para Kanban)
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
        return "bg-blue-50";
      case "Fazendo":
        return "bg-orange-50";
      case "Concluído":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 cursor-grab active:cursor-grabbing
                  ${getStatusColor(task.status)}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-800 text-lg flex-grow mr-2">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Editar Tarefa"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
            aria-label="Deletar Tarefa"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 text-red-600 animate-spin" /> : <Trash className="h-4 w-4 text-red-600" />}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{task.description.substring(0, 70)}{task.description.length > 70 ? "..." : ""}</p>
      <p className="text-xs text-gray-500 mt-2">Vencimento: {new Date(task.dueDate).toLocaleDateString()}</p>
      <div className="text-xs font-medium text-gray-700 mt-2">Progresso: {task.progress}%</div>
    </div>
  );
}


export default function KanbanPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, updateTask, deleteTask } = useTasks();
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState<string | null>(null);

  // Redireciona se o usuário não estiver logado
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

    if (!active || !over) return; // Nenhuma interação de arrastar e soltar válida

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Encontra a tarefa que foi arrastada
    const draggedTask = tasks.find(task => task.id === activeId);
    if (!draggedTask) return;

    // Se o item foi movido DENTRO da mesma coluna
    if (active.data.current?.sortable.containerId === over.data.current?.sortable.containerId) {
      const columnId = active.data.current?.sortable.containerId as ColumnId;
      const tasksInColumn = tasks.filter(task => task.status === KANBAN_COLUMNS[columnId]);
      
      const oldIndex = tasksInColumn.findIndex(task => task.id === activeId);
      const newIndex = tasksInColumn.findIndex(task => task.id === overId);

      // (Opcional) Se a ordem for importante, você teria que reordenar
      // e atualizar a propriedade `order` no Firestore.
      // Por simplicidade, estamos apenas movendo entre colunas no status.
      // Para reordenar, seria necessário um campo 'order' na Task e arrayMove.
      // const newOrderedTasks = arrayMove(tasksInColumn, oldIndex, newIndex);
      // console.log(`Tarefa ${activeId} reordenada dentro da coluna ${columnId}`);
    } else {
      // Se o item foi movido ENTRE colunas
      const newStatus = over.id.toString() as Task["status"]; // O id da coluna é o novo status
      if (Object.values(KANBAN_COLUMNS).includes(newStatus)) {
        try {
          await updateTask(activeId, { status: newStatus });
          console.log(`Tarefa ${activeId} movida para status: ${newStatus}`);
        } catch (error) {
          console.error("Erro ao atualizar status da tarefa:", error);
          alert("Erro ao mover tarefa.");
        }
      }
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.24))]">
        <p className="text-xl text-gray-700">Carregando Kanban...</p>
      </div>
    );
  }

  // Agrupa as tarefas por status para as colunas do Kanban
  const tasksByStatus = Object.values(KANBAN_COLUMNS).reduce((acc, status) => {
    acc[status as ColumnId] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<ColumnId, Task[]>);

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Quadro Kanban</h1>
      <p className="text-xl text-gray-600 mb-8">Arraste e solte tarefas para gerenciar seu fluxo de trabalho.</p>

      {tasksLoading && <p className="text-center text-gray-600">Carregando tarefas do Kanban...</p>}
      {tasksError && <p className="text-center text-red-600">{tasksError}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(KANBAN_COLUMNS).map(([columnId, columnName]) => (
            <div key={columnId} className="bg-gray-100 rounded-lg p-4 shadow-inner min-h-[400px]">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-between items-center">
                {columnName}
                <span className="text-sm font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {tasksByStatus[columnId as ColumnId]?.length || 0}
                </span>
              </h2>
              <SortableContext items={tasksByStatus[columnId as ColumnId] || []} strategy={verticalListSortingStrategy}>
                <div id={columnId} className="space-y-3">
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