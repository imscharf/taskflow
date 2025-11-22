import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority } from '../types';
import { v4 as uuidv4 } from 'uuid';

const calculateProgress = (subtasks: any[]): number => {
  if (!subtasks || subtasks.length === 0) return 0;
  const completedSubtasks = subtasks.filter((sub: any) => sub.completed).length;
  return Math.round((completedSubtasks / subtasks.length) * 100);
};

export function useTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`/api/tasks?userId=${currentUser.uid}`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setError("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, fetchTasks]);

  const addTask = useCallback(async (
    title: string,
    description: string,
    dueDate: string,
    priority: TaskPriority,
    subtasksTitles: string[] = []
  ) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");

    try {
      const initialSubtasks = subtasksTitles.map(title => ({
        id: uuidv4(),
        title,
        completed: false,
      }));

      const initialProgress = calculateProgress(initialSubtasks);

      const newTaskData = {
        userId: currentUser.uid,
        title,
        description,
        dueDate,
        priority,
        status: "A Fazer",
        subtasks: initialSubtasks,
        progress: initialProgress,
      };

      await axios.post('/api/tasks', newTaskData);
      await fetchTasks();

    } catch (err: any) {
      console.error("Erro ao adicionar tarefa:", err);
      setError("Não foi possível adicionar a tarefa.");
      throw err;
    }
  }, [currentUser, fetchTasks]);

  // --- CORREÇÃO IMPORTANTE AQUI (Optimistic Update) ---
  const updateTask = useCallback(async (taskId: string, updatedFields: Partial<Task>) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    
    // 1. Guarda o estado anterior caso precise reverter
    const previousTasks = [...tasks];

    // 2. Atualiza o estado local IMEDIATAMENTE
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let fieldsToUpdate: any = { ...updatedFields };
        if (updatedFields.subtasks !== undefined) {
          fieldsToUpdate.progress = calculateProgress(updatedFields.subtasks);
        }
        return { ...t, ...fieldsToUpdate };
      }
      return t;
    }));
    
    try {
      let fieldsToUpdate: any = { ...updatedFields };
      if (updatedFields.subtasks !== undefined) {
        fieldsToUpdate.progress = calculateProgress(updatedFields.subtasks);
      }
      
      // 3. Envia para o servidor em background
      await axios.put(`/api/tasks/${taskId}`, fieldsToUpdate);
      
    } catch (err: any) {
      console.error("Erro ao atualizar tarefa:", err);
      setError("Não foi possível atualizar a tarefa.");
      
      // 4. Se der erro, reverte para o estado anterior
      setTasks(previousTasks);
      throw err;
    }
  }, [currentUser, tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    
    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    try {
      await axios.delete(`/api/tasks/${taskId}`);
    } catch (err: any) {
      console.error("Erro ao deletar tarefa:", err);
      setError("Não foi possível deletar a tarefa.");
      setTasks(previousTasks); // Reverte se falhar
      throw err;
    }
  }, [currentUser, tasks]);

  return { tasks, loading, error, addTask, updateTask, deleteTask, refreshTasks: fetchTasks };
}