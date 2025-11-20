"use client";

import { Task, Subtask, TaskPriority } from "../../types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasks } from "../../hooks/useTasks";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Circle } from "lucide-react";

const taskEditSchema = z.object({
    title: z.string().min(1, "O título é obrigatório."),
    description: z.string().optional(),
    dueDate: z.string().min(1, "A data de vencimento é obrigatória."),
    priority: z.nativeEnum(TaskPriority, {
        message: "A prioridade é obrigatória.",
    }),
    status: z.enum(["A Fazer", "Fazendo", "Concluído"]),
});

type TaskEditInputs = z.infer<typeof taskEditSchema>;

interface TaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
    const { updateTask } = useTasks();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentSubtasks, setCurrentSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TaskEditInputs>({
        resolver: zodResolver(taskEditSchema),
        defaultValues: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
        },
    });

    useEffect(() => {
        if (isOpen && task) {
            reset({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.priority,
                status: task.status,
            });
            setCurrentSubtasks(task.subtasks || []);
        }
    }, [isOpen, task, reset]);

    const onSubmit = async (data: TaskEditInputs) => {
        setLoading(true);
        setError(null);
        try {
            await updateTask(task.id, {
                title: data.title,
                description: data.description || "",
                dueDate: data.dueDate,
                priority: data.priority,
                status: data.status,
                subtasks: currentSubtasks,
            });
            alert("Tarefa atualizada com sucesso!");
            onClose();
        } catch (err: any) {
            console.error("Erro ao atualizar tarefa:", err);
            setError("Erro ao atualizar tarefa. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            setCurrentSubtasks(prev => [...prev, { id: Date.now().toString(), title: newSubtaskTitle.trim(), completed: false }]);
            setNewSubtaskTitle("");
        }
    };

    const handleDeleteSubtask = (id: string) => {
        setCurrentSubtasks(prev => prev.filter(sub => sub.id !== id));
    };

    const handleToggleSubtask = (id: string) => {
        setCurrentSubtasks(prev => prev.map(sub =>
            sub.id === id ? { ...sub, completed: !sub.completed } : sub
        ));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 border border-border">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    aria-label="Fechar"
                >
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold mb-6 text-foreground text-center">Editar Tarefa</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-foreground">Título</label>
                        <input
                            id="title"
                            type="text"
                            {...register("title")}
                            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        />
                        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground">Descrição</label>
                        <textarea
                            id="description"
                            {...register("description")}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">Vencimento</label>
                            <input
                                id="dueDate"
                                type="date"
                                {...register("dueDate")}
                                className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-foreground">Prioridade</label>
                            <select
                                id="priority"
                                {...register("priority")}
                                className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            >
                                {Object.values(TaskPriority).map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-foreground">Status</label>
                            <select
                                id="status"
                                {...register("status")}
                                className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            >
                                <option value="A Fazer">A Fazer</option>
                                <option value="Fazendo">Fazendo</option>
                                <option value="Concluído">Concluído</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                        <h3 className="text-lg font-bold text-foreground mb-3">Gerenciar Sub-tarefas</h3>
                        <div className="space-y-2 mb-4">
                            {currentSubtasks.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma sub-tarefa.</p>}
                            {currentSubtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                    <div className="flex items-center grow">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSubtask(subtask.id)}
                                            className="mr-2 p-1 rounded-full hover:bg-accent"
                                        >
                                            {subtask.completed ? (
                                                <Check className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </button>
                                        <span className={`text-foreground ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                        className="p-1 rounded-full hover:bg-destructive/10 text-destructive ml-2"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                placeholder="Nova sub-tarefa"
                                className="grow px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </div>
    );
}