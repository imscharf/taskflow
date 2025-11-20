// taskflow/app/calendar/page.tsx
"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid"; // Opcional, para visualizações de semana/dia
import { useTasks } from "../../../hooks/useTasks";
import { Task } from "../../../types";
import { TaskModal } from "../../../components/tasks/TaskModal"; // Reutiliza o modal de edição

export default function CalendarPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Redireciona se o usuário não estiver logado
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.24))]">
        <p className="text-xl text-gray-700">Carregando calendário...</p>
      </div>
    );
  }

  // Mapeia as tarefas para o formato de eventos do FullCalendar
  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate, // Usa a data de vencimento como início do evento
    // end: task.dueDate, // Opcional, para eventos que duram o dia todo
    allDay: true,
    backgroundColor: task.status === "Concluído" ? "#10B981" : "#3B82F6", // Cores baseadas no status
    borderColor: task.status === "Concluído" ? "#059669" : "#2563EB",
    textColor: "#ffffff",
    extendedProps: { // Informações adicionais da tarefa
      description: task.description,
      priority: task.priority,
      status: task.status,
      subtasks: task.subtasks,
      progress: task.progress,
    }
  }));

  const handleEventClick = (clickInfo: any) => {
    // Encontra a tarefa original pelo ID do evento
    const clickedTask = tasks.find(task => task.id === clickInfo.event.id);
    if (clickedTask) {
      setSelectedTask(clickedTask);
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    // Logic to update the task's due date in Firestore
    const taskId = dropInfo.event.id;
    const newDueDate = dropInfo.event.startStr.split('T')[0]; // Pega apenas a data sem a hora
    
    try {
      await useTasks().updateTask(taskId, { dueDate: newDueDate });
      alert("Data da tarefa atualizada!");
    } catch (error) {
      console.error("Erro ao mover tarefa no calendário:", error);
      alert("Erro ao mover tarefa.");
    }
  };


  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Calendário de Tarefas</h1>
      <p className="text-xl text-gray-600 mb-8">Visualize suas tarefas por data de vencimento.</p>

      {tasksLoading && <p className="text-center text-gray-600">Carregando tarefas do calendário...</p>}
      {tasksError && <p className="text-center text-red-600">{tasksError}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="pt-br" // Define o idioma para português
          events={events}
          eventClick={handleEventClick} // Abre o modal ao clicar no evento
          editable={true} // Permite arrastar e soltar eventos
          eventDrop={handleEventDrop} // Lida com o evento de arrastar e soltar
          // Outras opções do FullCalendar podem ser adicionadas aqui
        />
      </div>

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