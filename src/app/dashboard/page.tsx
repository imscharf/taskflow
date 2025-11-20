// taskflow/app/dashboard/page.tsx (Atualizado para incluir TaskList)
"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Title, Text, Metric, DonutChart, BarChart } from "@tremor/react";
import { ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import { TaskForm } from "../../../components/tasks/TaskForm";
import { useTasks } from "../../../hooks/useTasks";
import { TaskPriority } from "../../../types";
import { TaskList } from "../../../components/tasks/TaskList"; // Importa o TaskList

export default function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.24))]">
        <p className="text-xl text-gray-700">Carregando dashboard...</p>
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
    { name: "Concluídas", "Tarefas por Semana": completedThisWeek },
    { name: "Pendentes", "Tarefas por Semana": totalPendingTasks },
    { name: "Vencidas", "Tarefas por Semana": totalOverdueTasks },
  ];

  const tasksByPriority = Object.values(TaskPriority).map(priority => ({
    name: priority,
    tasks: tasks.filter(task => task.priority === priority).length,
  }));

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Olá, {currentUser.email}!</h1>
      <p className="text-xl text-gray-600 mb-8">Bem-vindo ao seu Dashboard TaskFlow.</p>

      {tasksLoading && <p className="text-center text-gray-600">Carregando suas tarefas...</p>}
      {tasksError && <p className="text-center text-red-600">{tasksError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="mx-auto w-full md:max-w-xs">
          <Text>Tarefas Pendentes</Text>
          <Metric className="flex items-center gap-2 mt-2">
            {totalPendingTasks} <Clock className="w-6 h-6 text-yellow-500" />
          </Metric>
          <Text className="mt-2 text-gray-500">Mantenha o foco!</Text>
        </Card>

        <Card className="mx-auto w-full md:max-w-xs">
          <Text>Concluídas (Semana)</Text>
          <Metric className="flex items-center gap-2 mt-2">
            {completedThisWeek} <CheckCircle className="w-6 h-6 text-green-500" />
          </Metric>
          <Text className="mt-2 text-gray-500">Bom trabalho!</Text>
        </Card>

        <Card className="mx-auto w-full md:max-w-xs">
          <Text>Tarefas Vencidas</Text>
          <Metric className="flex items-center gap-2 mt-2">
            {totalOverdueTasks} <ArrowUpRight className="w-6 h-6 text-red-500 transform rotate-45" />
          </Metric>
          <Text className="mt-2 text-gray-500">Revise suas prioridades.</Text>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="mx-auto w-full lg:max-w-lg">
          <Title>Tarefas por Status (Visão Geral)</Title>
          <Text>Progresso geral das suas tarefas.</Text>
          <BarChart
            className="mt-6"
            data={tasksByWeekStatus}
            index="name"
            categories={["Tarefas por Semana"]}
            colors={["blue", "yellow", "red"]}
            yAxisWidth={48}
          />
        </Card>

        <Card className="mx-auto w-full lg:max-w-lg">
          <Title>Tarefas por Prioridade</Title>
          <Text>Distribuição das suas tarefas por nível de importância.</Text>
          <DonutChart
            className="mt-6"
            data={tasksByPriority}
            category="tasks"
            index="name"
            valueFormatter={(number: number) => `${number} tarefas`}
            colors={["emerald", "orange", "rose"]}
          />
        </Card>
      </div>

      <div className="my-10">
        <TaskForm />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Suas Tarefas</h2>
      <TaskList /> {/* Componente de listagem de tarefas */}
    </div>
  );
}