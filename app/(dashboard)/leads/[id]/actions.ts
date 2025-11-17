'use server';

import { createNote, deleteNoteById, createTask, updateTask, deleteTaskById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addNote(leadId: number, content: string) {
  try {
    await createNote({
      entityType: 'lead',
      entityId: leadId,
      content,
      createdBy: 'Utilisateur' // In a real app, this would be the current user
    });
    
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error('Error adding note:', error);
    return { success: false, error: 'Failed to add note' };
  }
}

export async function deleteNote(noteId: number) {
  try {
    await deleteNoteById(noteId);
    revalidatePath('/leads/[id]');
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}

interface AddTaskData {
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: 'haute' | 'normale' | 'basse';
}

export async function addTask(leadId: number, taskData: AddTaskData) {
  try {
    await createTask({
      entityType: 'lead',
      entityId: leadId,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: 'a_faire',
      assignedTo: 'Utilisateur', // In a real app, this would be the current user
      completedAt: null
    });
    
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error('Error adding task:', error);
    return { success: false, error: 'Failed to add task' };
  }
}

export async function updateTaskStatus(taskId: number, status: 'a_faire' | 'en_cours' | 'termine') {
  try {
    const completedAt = status === 'termine' ? new Date() : null;
    await updateTask(taskId, { status, completedAt });
    revalidatePath('/leads/[id]');
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function deleteTask(taskId: number) {
  try {
    await deleteTaskById(taskId);
    revalidatePath('/leads/[id]');
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

