"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTasks } from "../../../hooks/useTasks";
import { Task } from "../../../types";
import { TaskModal } from "../../../components/tasks/TaskModal";
import { Loader2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Definição das colunas
const KANBAN_COLUMNS = {
  "A Fazer": "A Fazer",
  "Fazendo": "Fazendo",
  "Concluído": "Concluído",
};

type ColumnId = keyof typeof KANBAN_COLUMNS;

// --- Componente do Card Arrastável (Item) ---
interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDeleting: boolean;
}

function SortableTaskCard({ task, onEdit, onDelete, isDeleting }: SortableTaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "A Fazer": return "border-l-4 border-l-blue-500";
      case "Fazendo": return "border-l-4 border-l-orange-500";
      case "Concluído": return "border-l-4 border-l-green-500";
      default: return "border-l-4 border-l-gray-500";
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-accent/20 border-2 border-dashed border-primary/50 rounded-lg h-[100px] mb-3"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card text-card-foreground rounded-lg shadow-sm p-4 mb-3 border border-border cursor-grab active:cursor-grabbing touch-none relative
                  ${getStatusColor(task.status)} hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-foreground text-sm grow mr-2 wrap-break-word">{task.title}</h4>
        <div className="flex space-x-1 shrink-0">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(task)}
            className="p-1 rounded-full hover:bg-accent hover:text-accent-foreground"
          >
            <Edit className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
    </div>
  );
}

// --- Componente da Coluna (Droppable) ---
function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  children 
}: { 
  id: ColumnId; 
  title: string; 
  tasks: Task[]; 
  children: React.ReactNode 
}) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  return (
    <div ref={setNodeRef} className="bg-muted/30 border border-border rounded-lg p-4 shadow-sm flex flex-col min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <span className="text-sm font-medium bg-background text-foreground border border-border px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="grow space-y-3">
        {children}
      </div>
    </div>
  );
}

// --- Componente Overlay (Card Flutuante) ---
function TaskOverlay({ task }: { task: Task }) {
  if (!task) return null;
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-xl p-4 border border-border cursor-grabbing scale-105 rotate-2 border-l-4 border-l-primary">
      <h4 className="font-semibold text-foreground text-sm mb-2">{task.title}</h4>
    </div>
  );
}

// --- Página Principal ---
export default function KanbanPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, updateTask, deleteTask } = useTasks();
  const router = useRouter();

  // Estado local sincronizado para permitir Drag and Drop fluido
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState<string | null>(null);

  // Sincroniza com o banco
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // --- Lógica DnD ---

  const findContainer = (id: string): ColumnId | undefined => {
    if (id in KANBAN_COLUMNS) return id as ColumnId;
    return localTasks.find((t) => t.id === id)?.status as ColumnId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Atualiza visualmente enquanto arrasta (Muda a coluna localmente)
    setLocalTasks((prev) => {
      return prev.map((t) => {
        if (t.id === active.id) {
          return { ...t, status: overContainer as Task["status"] };
        }
        return t;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over?.id as string;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const overContainer = findContainer(overId);
    const activeTask = localTasks.find(t => t.id === activeId);

    if (activeTask && overContainer && activeTask.status !== overContainer) {
      // Mudou de coluna (mesmo soltando no vazio da coluna)
      // Atualiza estado local final
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overContainer as Task["status"] } : t))
      );

      // Atualiza no banco
      try {
        await updateTask(activeId, { status: overContainer as Task["status"] });
      } catch (error) {
        console.error("Erro ao salvar movimento:", error);
        // Reverte se der erro (o useEffect de tasks cuidará disso)
      }
    }

    setActiveTask(null);
  };

  // Helpers de CRUD
  const handleDelete = (taskId: string) => {
    toast("Excluir Tarefa?", {
      description: "Tem certeza que deseja deletar esta tarefa? A ação é irreversível.",
      action: {
        label: "Excluir",
        onClick: async () => {
          setIsDeletingTask(taskId);
          try {
            await deleteTask(taskId);
            toast.success("Tarefa deletada com sucesso!");
          } catch (error) {
            console.error("Erro ao deletar:", error);
            toast.error("Erro ao deletar tarefa.");
          } finally {
            setIsDeletingTask(null);
          }
        },
      },
      cancel: {
        label: "Cancelar",
      },
      actionButtonStyle: {
        backgroundColor: "#ef4444", // Vermelho para indicar perigo
        color: "white",
      },
    });
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  if (authLoading || !currentUser) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background transition-colors duration-300">
      <h1 className="text-4xl font-bold text-foreground mb-6">Quadro Kanban</h1>
      
      {tasksLoading && <p className="text-muted-foreground">Carregando...</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(KANBAN_COLUMNS).map(([columnId, columnName]) => {
            const columnTasks = localTasks.filter((t) => t.status === columnId);
            
            return (
              <KanbanColumn key={columnId} id={columnId as ColumnId} title={columnName} tasks={columnTasks}>
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={setSelectedTaskForEdit}
                      onDelete={handleDelete}
                      isDeleting={isDeletingTask === task.id}
                    />
                  ))}
                </SortableContext>
                
                {/* Área visual quando vazio */}
                {columnTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-muted-foreground/50 text-sm">
                    Arraste para aqui
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <TaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTaskForEdit && (
        <TaskModal
          task={selectedTaskForEdit}
          isOpen={!!selectedTaskForEdit}
          onClose={() => setSelectedTaskForEdit(null)}
        />
      )}
    </div>
  );
}