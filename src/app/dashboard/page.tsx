"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, Title, Text, Metric, DonutChart, BarChart, Legend } from "@tremor/react";
import { ArrowUpRight, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { TaskForm } from "../../../components/tasks/TaskForm";
import { useTasks } from "../../../hooks/useTasks";
import { TaskPriority } from "../../../types";
import { TaskList } from "../../../components/tasks/TaskList";


export default function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, refreshTasks } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-(--spacing(24)))] bg-background">
        <p className="text-xl text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  const totalPendingTasks = tasks.filter(task => task.status === "A Fazer" || task.status === "Fazendo").length;
  const totalOverdueTasks = tasks.filter(task => new Date(task.dueDate) < new Date() && (task.status === "A Fazer" || task.status === "Fazendo")).length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeek = tasks.filter(task =>
    task.status === "Concluído" && new Date(task.updatedAt) > oneWeekAgo
  ).length;

  const tasksByWeekStatus = [
    { name: "Concluídas", "Tarefas": completedThisWeek },
    { name: "Pendentes", "Tarefas": totalPendingTasks },
    { name: "Vencidas", "Tarefas": totalOverdueTasks },
  ];

  const tasksByPriority = Object.values(TaskPriority).map(priority => ({
    name: priority,
    tasks: tasks.filter(task => task.priority === priority).length,
  }));

  // Verifica se tem dados para mostrar nos gráficos
  const hasTasks = tasks.length > 0;

  return (
    <div className="min-h-[calc(100vh-(--spacing(24)))] p-8 bg-background transition-colors duration-300">
      <h1 className="text-4xl font-bold text-foreground mb-6">Olá, {currentUser.displayName || currentUser.email}!</h1>
      <p className="text-xl text-muted-foreground mb-8">Bem-vindo ao seu Dashboard TaskFlow.</p>

      {tasksLoading && (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin mr-2 text-primary" />
            <p className="text-muted-foreground">Sincronizando tarefas...</p>
        </div>
      )}
      {tasksError && <p className="text-center text-destructive mb-4">{tasksError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="mx-auto w-full md:max-w-xs dark:bg-card dark:ring-border decoration-top decoration-yellow-500">
          <Text>Tarefas Pendentes</Text>
          <Metric className="flex items-center gap-2 mt-2 text-foreground">
            {totalPendingTasks} <Clock className="w-6 h-6 text-yellow-500" />
          </Metric>
          <Text className="mt-2 text-muted-foreground">Mantenha o foco!</Text>
        </Card>

        <Card className="mx-auto w-full md:max-w-xs dark:bg-card dark:ring-border decoration-top decoration-green-500">
          <Text>Concluídas (Semana)</Text>
          <Metric className="flex items-center gap-2 mt-2 text-foreground">
            {completedThisWeek} <CheckCircle className="w-6 h-6 text-green-500" />
          </Metric>
          <Text className="mt-2 text-muted-foreground">Bom trabalho!</Text>
        </Card>

        <Card className="mx-auto w-full md:max-w-xs dark:bg-card dark:ring-border decoration-top decoration-red-500">
          <Text>Tarefas Vencidas</Text>
          <Metric className="flex items-center gap-2 mt-2 text-foreground">
            {totalOverdueTasks} <ArrowUpRight className="w-6 h-6 text-red-500 transform rotate-45" />
          </Metric>
          <Text className="mt-2 text-muted-foreground">Revise suas prioridades.</Text>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Gráfico de Barras */}
        <Card className="mx-auto w-full lg:max-w-lg dark:bg-card dark:ring-border">
          <Title className="text-foreground">Tarefas por Status</Title>
          <Text>Progresso geral das suas tarefas.</Text>
          <BarChart
            className="mt-6 h-80"
            data={tasksByWeekStatus}
            index="name"
            categories={["Tarefas"]}
            colors={["blue"]}
            yAxisWidth={48}
            showAnimation={true}
          />
        </Card>

        {/* Gráfico de Rosca (Donut) com tratamento de estado vazio */}
        <Card className="mx-auto w-full lg:max-w-lg dark:bg-card dark:ring-border flex flex-col">
          <Title className="text-foreground">Tarefas por Prioridade</Title>
          <Text>Distribuição das suas tarefas por nível de importância.</Text>
          
          {hasTasks ? (
            <DonutChart
              className="mt-6 h-80"
              data={tasksByPriority}
              category="tasks"
              index="name"
              valueFormatter={(number: number) => ` ${number} tarefa(s)`}
              colors={["emerald", "orange", "red"]}
              showAnimation={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhum dado para exibir.</p>
              <p className="text-sm">Crie uma tarefa para ver o gráfico.</p>
            </div>
          )}
        </Card>
      </div>

      <div className="my-10">
        <TaskForm onTaskAdded={refreshTasks} />
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-6">Suas Tarefas</h2>
      
      <TaskList tasks={tasks} onUpdate={refreshTasks} />
    </div>
  );
}