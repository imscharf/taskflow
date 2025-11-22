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

  // Função para buscar tarefas via Axios
  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Chamada à API criada (Route Handler)
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

  // Carrega tarefas inicial
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

      // POST via Axios
      await axios.post('/api/tasks', newTaskData);
      
      // Atualiza a lista após adicionar
      await fetchTasks();

    } catch (err: any) {
      console.error("Erro ao adicionar tarefa:", err);
      setError("Não foi possível adicionar a tarefa.");
      throw err;
    }
  }, [currentUser, fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updatedFields: Partial<Task>) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    
    try {
      let fieldsToUpdate: any = { ...updatedFields };
      
      if (updatedFields.subtasks !== undefined) {
        fieldsToUpdate.progress = calculateProgress(updatedFields.subtasks);
      }
      
      // PUT via Axios
      await axios.put(`/api/tasks/${taskId}`, fieldsToUpdate);
      
      // Atualiza a lista após editar
      // Otimização otimista: atualiza o estado local antes para ser rápido
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...fieldsToUpdate } : t));
      
      // Opcional: recarregar do servidor para garantir consistência
      // await fetchTasks(); 
    } catch (err: any) {
      console.error("Erro ao atualizar tarefa:", err);
      setError("Não foi possível atualizar a tarefa.");
      throw err;
    }
  }, [currentUser]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    
    try {
      // DELETE via Axios
      await axios.delete(`/api/tasks/${taskId}`);
      
      // Atualiza a lista removendo o item localmente
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error("Erro ao deletar tarefa:", err);
      setError("Não foi possível deletar a tarefa.");
      throw err;
    }
  }, [currentUser]);

  return { tasks, loading, error, addTask, updateTask, deleteTask, refreshTasks: fetchTasks };
}