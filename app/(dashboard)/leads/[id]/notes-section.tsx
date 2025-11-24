'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { SelectNote } from '@/lib/db';
import { addNote, deleteNote } from './actions';
import { useRouter } from 'next/navigation';

interface NotesSectionProps {
  leadId: number;
  notes: SelectNote[];
}

export function NotesSection({ leadId, notes }: NotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addNote(leadId, newNoteContent);
      if (result.success) {
        setNewNoteContent('');
        setIsAdding(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette note ?');
    if (!confirmed) return;

    try {
      const result = await deleteNote(noteId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  return (
    <div className="space-y-4">
      {notes.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucune note pour le moment.</p>
        </div>
      )}

      {notes.map((note) => (
        <Card key={note.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{note.createdBy}</span>
                <span className="text-xs text-muted-foreground">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Date indisponible'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteNote(note.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      {isAdding ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Ajoutez une note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleAddNote} disabled={isSubmitting || !newNoteContent.trim()}>
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une note
        </Button>
      )}
    </div>
  );
}






















