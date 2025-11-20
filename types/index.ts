// taskflow/types/index.ts

// Enum para Prioridade da Tarefa
export enum TaskPriority {
  LOW = "Baixa",
  MEDIUM = "Média",
  HIGH = "Alta",
}

// Interface para uma Sub-tarefa
export interface Subtask {
  id: string; // ID único para a sub-tarefa (gerado no cliente ou no servidor)
  title: string;
  completed: boolean;
}

// Interface para uma Tarefa Principal
export interface Task {
  id: string; // ID do documento Firestore
  userId: string; // ID do usuário a quem a tarefa pertence
  title: string;
  description: string;
  dueDate: string; // Data de vencimento no formato ISO string (e.g., "YYYY-MM-DD")
  priority: TaskPriority;
  status: "A Fazer" | "Fazendo" | "Concluído"; // Para o Kanban
  subtasks: Subtask[]; // Lista de sub-tarefas
  progress: number; // Porcentagem de progresso (0-100)
  createdAt: number; // Timestamp de criação (Unix timestamp)
  updatedAt: number; // Timestamp de última atualização (Unix timestamp)
}

// Adaptação para dados vindos do Firestore
// O Firestore pode retornar Timestamps ou Dates, então é bom ter flexibilidade
export interface TaskFirestore {
  id?: string; // ID pode não vir no objeto do documento, mas sim no metadata
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: "A Fazer" | "Fazendo" | "Concluído";
  subtasks: Subtask[];
  progress: number;
  createdAt: Date | number; // Firestore Timestamp é convertido para Date no SDK JS
  updatedAt: Date | number;
}