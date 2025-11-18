'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react';
import { SelectTask } from '@/lib/db';
import { addTask, updateTaskStatus, deleteTask } from './actions';
import { useRouter } from 'next/navigation';

interface TasksSectionProps {
  leadId: number;
  tasks: SelectTask[];
}

export function TasksSection({ leadId, tasks }: TasksSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'normale' as 'haute' | 'normale' | 'basse'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addTask(leadId, {
        title: newTask.title,
        description: newTask.description || null,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        priority: newTask.priority
      });
      
      if (result.success) {
        setNewTask({ title: '', description: '', dueDate: '', priority: 'normale' });
        setIsAdding(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: 'a_faire' | 'en_cours' | 'termine') => {
    try {
      const result = await updateTaskStatus(taskId, status);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
    if (!confirmed) return;

    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'termine':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'en_cours':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'a_faire': return 'À faire';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      default: return status;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'haute': return 'destructive';
      case 'normale': return 'default';
      case 'basse': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'haute': return 'Haute';
      case 'normale': return 'Normale';
      case 'basse': return 'Basse';
      default: return priority;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucune tâche pour le moment.</p>
        </div>
      )}

      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => {
                const nextStatus = task.status === 'a_faire' ? 'en_cours' : 
                                 task.status === 'en_cours' ? 'termine' : 'a_faire';
                handleUpdateTaskStatus(task.id, nextStatus);
              }}
              className="mt-1"
            >
              {getStatusIcon(task.status)}
            </button>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-medium ${task.status === 'termine' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  <Badge variant="outline">
                    {getStatusLabel(task.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.dueDate ? (
                  <span>
                    Échéance:{' '}
                    {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                ) : null}
                <span>
                  Créé le{' '}
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString('fr-FR')
                    : 'Date indisponible'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {isAdding ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                placeholder="Titre de la tâche"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la tâche..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'haute' | 'normale' | 'basse') => 
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="basse">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTask({ title: '', description: '', dueDate: '', priority: 'normale' });
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleAddTask} disabled={isSubmitting || !newTask.title.trim()}>
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une tâche
        </Button>
      )}
    </div>
  );
}






