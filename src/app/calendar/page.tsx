"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useTasks } from "../../../hooks/useTasks";
import { Task } from "../../../types";
import { TaskModal } from "../../../components/tasks/TaskModal";

export default function CalendarPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-(--spacing(24)))] bg-background">
        <p className="text-xl text-muted-foreground">Carregando calendário...</p>
      </div>
    );
  }

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate,
    allDay: true,
    backgroundColor: task.status === "Concluído" ? "#10B981" : "#3B82F6",
    borderColor: task.status === "Concluído" ? "#059669" : "#2563EB",
    textColor: "#ffffff",
  }));

  const handleEventClick = (clickInfo: any) => {
    const clickedTask = tasks.find(task => task.id === clickInfo.event.id);
    if (clickedTask) {
      setSelectedTask(clickedTask);
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    const taskId = dropInfo.event.id;
    const newDueDate = dropInfo.event.startStr.split('T')[0];
    
    try {
      await useTasks().updateTask(taskId, { dueDate: newDueDate });
      alert("Data da tarefa atualizada!");
    } catch (error) {
      console.error("Erro ao mover tarefa no calendário:", error);
      alert("Erro ao mover tarefa.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background transition-colors duration-300">
      <h1 className="text-4xl font-bold text-foreground mb-6">Calendário de Tarefas</h1>
      <p className="text-xl text-muted-foreground mb-8">Visualize suas tarefas por data de vencimento.</p>

      {tasksLoading && <p className="text-center text-muted-foreground">Carregando tarefas do calendário...</p>}
      {tasksError && <p className="text-center text-destructive">{tasksError}</p>}

      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="pt-br"
          events={events}
          eventClick={handleEventClick}
          editable={true}
          eventDrop={handleEventDrop}
          height="auto"
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