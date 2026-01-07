import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ToastService } from '../services/toast.service';
import { Session, WorkoutEntry, Set } from '../models/session';
import { Exercise } from '../models/exercise';

@Component({
  standalone: true,
  selector: 'history-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.css']
})
export default class HistoryListComponent {
  sessions: Session[] = [];
  sessionToDelete: Session | null = null;
  showDeleteModal = false;
  sessionToEdit: Session | null = null;
  editedSession: Session | null = null;
  showEditModal = false;
  exercises: Exercise[] = [];

  constructor(private svc: WorkoutService, private toastService: ToastService) {
    this.sessions = this.svc.getSessions();
    this.exercises = this.svc.getExercises();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalSets(session: Session): number {
    return session.entries.reduce((total, entry) => total + entry.sets.length, 0);
  }

  getTotalVolume(session: Session): number {
    let total = 0;
    for (const entry of session.entries) {
      for (const set of entry.sets) {
        if (set.weightKg && set.reps) {
          total += set.weightKg * set.reps;
        }
      }
    }
    return total;
  }

  openDeleteModal(session: Session): void {
    this.sessionToDelete = session;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.sessionToDelete = null;
  }

  confirmDelete(): void {
    if (this.sessionToDelete) {
      this.svc.deleteSession(this.sessionToDelete.id);
      this.sessions = this.svc.getSessions();
      this.toastService.error('Sessione eliminata con successo!');
      this.closeDeleteModal();
    }
  }

  openEditModal(session: Session): void {
    this.sessionToEdit = session;
    // Create a deep copy for editing
    this.editedSession = {
      ...session,
      entries: session.entries.map(entry => ({
        ...entry,
        sets: entry.sets.map(set => ({ ...set }))
      }))
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.sessionToEdit = null;
    this.editedSession = null;
  }

  saveEdit(): void {
    if (!this.editedSession) return;

    // Validate that all entries have at least one set
    for (const entry of this.editedSession.entries) {
      if (entry.sets.length === 0) {
        this.toastService.warning(`L'esercizio "${entry.name}" deve avere almeno una serie!`);
        return;
      }
    }

    this.svc.updateSession(this.editedSession);
    this.sessions = this.svc.getSessions();
    this.toastService.success('Modifica effettuata con successo!');
    this.closeEditModal();
  }

  cancelEdit(): void {
    this.closeEditModal();
  }

  onExerciseChange(entry: WorkoutEntry): void {
    const ex = this.exercises.find(x => x.id === entry.exerciseId);
    if (!ex) return;
    entry.name = ex.name;
    entry.muscleGroup = ex.muscleGroup;
    if (entry.sets.length === 0) {
      entry.sets = [{ reps: ex.reps || 8, weightKg: ex.weightKg }];
    }
  }

  addExerciseToEdit(): void {
    if (!this.editedSession || this.exercises.length === 0) return;
    const ex = this.exercises[0];
    const entry: WorkoutEntry = {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: [{ reps: ex.reps || 8, weightKg: ex.weightKg }],
      notes: ''
    };
    this.editedSession.entries.push(entry);
  }

  removeEntryFromEdit(index: number): void {
    if (!this.editedSession) return;
    this.editedSession.entries.splice(index, 1);
  }

  addSetToEntry(entry: WorkoutEntry): void {
    const lastSet = entry.sets[entry.sets.length - 1];
    entry.sets.push({
      reps: lastSet?.reps || 8,
      weightKg: lastSet?.weightKg
    });
  }

  removeSetFromEntry(entry: WorkoutEntry, setIndex: number): void {
    if (entry.sets.length > 1) {
      entry.sets.splice(setIndex, 1);
    } else {
      this.toastService.warning('Ogni esercizio deve avere almeno una serie!');
    }
  }
}
