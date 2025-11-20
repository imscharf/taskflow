// taskflow/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData, // Importar DocumentData
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Task, Subtask, TaskPriority, TaskFirestore } from '../types';
import { v4 as uuidv4 } from 'uuid';

const calculateProgress = (subtasks: Subtask[]): number => {
  if (subtasks.length === 0) return 0;
  const completedSubtasks = subtasks.filter(sub => sub.completed).length;
  return Math.round((completedSubtasks / subtasks.length) * 100);
};

// Ajuste nesta função
const mapFirestoreDocToTask = (doc: QueryDocumentSnapshot<DocumentData>): Task => {
  // Faz um cast para TaskFirestore. Assumimos que os dados no Firestore seguem esta estrutura.
  const data = doc.data() as TaskFirestore; 
  
  // Função auxiliar para converter Timestamp ou retornar número
  const convertTimestampToNumber = (timestampLike: any): number => {
    // Verifica se é um objeto e tem o método .toDate() (indicando um Firebase Timestamp)
    if (timestampLike && typeof timestampLike === 'object' && 'toDate' in timestampLike && typeof timestampLike.toDate === 'function') {
      return timestampLike.toDate().getTime();
    }
    // Caso contrário, assume que já é um número (Unix timestamp) ou retorna 0/NaN se não for válido
    return typeof timestampLike === 'number' ? timestampLike : 0; 
  };

  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    priority: data.priority,
    status: data.status,
    subtasks: data.subtasks || [],
    progress: data.progress,
    // Usa a função auxiliar para createdAt e updatedAt
    createdAt: convertTimestampToNumber(data.createdAt), 
    updatedAt: convertTimestampToNumber(data.updatedAt),
  };
};

export function useTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksCollectionRef = collection(db, "tasks");
    
    const q = query(
      tasksCollectionRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Agora, o snapshot.docs.map espera o tipo QueryDocumentSnapshot<DocumentData>
        const fetchedTasks: Task[] = snapshot.docs.map(mapFirestoreDocToTask);
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao buscar tarefas:", err);
        setError("Erro ao carregar tarefas.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = useCallback(async (
    title: string,
    description: string,
    dueDate: string,
    priority: TaskPriority,
    subtasksTitles: string[] = []
  ) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");

    setError(null);
    try {
      const initialSubtasks: Subtask[] = subtasksTitles.map(title => ({
        id: uuidv4(),
        title,
        completed: false,
      }));

      const initialProgress = calculateProgress(initialSubtasks);

      // Criamos um objeto que é compatível com Firestore, que pode receber Timestamps
      const taskDataForFirestore: Omit<TaskFirestore, 'id' | 'createdAt' | 'updatedAt'> & {
        createdAt: any; // serverTimestamp() retorna um tipo especial
        updatedAt: any; // serverTimestamp() retorna um tipo especial
      } = {
        userId: currentUser.uid,
        title,
        description,
        dueDate,
        priority,
        status: "A Fazer",
        subtasks: initialSubtasks,
        progress: initialProgress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, "tasks"), taskDataForFirestore);

    } catch (err: any) {
      console.error("Erro ao adicionar tarefa:", err);
      setError("Não foi possível adicionar a tarefa.");
      throw err;
    }
  }, [currentUser]);

  const updateTask = useCallback(async (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    setError(null);
    try {
      const taskRef = doc(db, "tasks", taskId);
      let fieldsToUpdate: Partial<DocumentData> = { ...updatedFields }; // Tipo DocumentData aqui
      
      if (updatedFields.subtasks !== undefined) {
        fieldsToUpdate.progress = calculateProgress(updatedFields.subtasks);
      }
      
      await updateDoc(taskRef, {
        ...fieldsToUpdate,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Erro ao atualizar tarefa:", err);
      setError("Não foi possível atualizar a tarefa.");
      throw err;
    }
  }, [currentUser]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");
    setError(null);
    try {
      const taskRef = doc(db, "tasks", taskId);
      await deleteDoc(taskRef);
    } catch (err: any) {
      console.error("Erro ao deletar tarefa:", err);
      setError("Não foi possível deletar a tarefa.");
      throw err;
    }
  }, [currentUser]);

  return { tasks, loading, error, addTask, updateTask, deleteTask };
}