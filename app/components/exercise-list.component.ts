import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ToastService } from '../services/toast.service';
import { Exercise } from '../models/exercise';

@Component({
  standalone: true,
  selector: 'app-exercise-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent {
  exercises: Exercise[] = [];
  editMode: boolean = false;
  exerciseToEdit: Exercise = new Exercise();

  constructor(
    private workoutService: WorkoutService,
    private toastService: ToastService
  ) {
    this.exercises = this.workoutService.getExercises();
  }

  insertExercise() {
    this.editMode = true;
    this.exerciseToEdit = new Exercise();
  }

  editExercise(exercise: Exercise) {
    this.editMode = true;
    this.exerciseToEdit = { ...exercise };
  }


  saveExercise() {
    if (!this.exerciseToEdit.name || this.exerciseToEdit.name.trim() === '') {
      this.toastService.warning('Il nome dell\'esercizio è obbligatorio!');
      return;
    }
    this.workoutService.saveExercise(this.exerciseToEdit);
    this.exercises = this.workoutService.getExercises();
    const isNew = this.exerciseToEdit.id === 0;
    this.editMode = false;
    this.exerciseToEdit = new Exercise();
    if (isNew) {
      this.toastService.success('Elemento aggiunto con successo!');
    } else {
      this.toastService.success('Modifiche salvate correttamente!');
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.exerciseToEdit = new Exercise();
  }

  deleteExercise(id: number) {
    const confirmed = confirm('Sei sicuro di voler eliminare questo esercizio?');
    if (confirmed) {
      this.workoutService.deleteExercise(id);
      this.exercises = this.workoutService.getExercises();
      this.toastService.error('Esercizio eliminato con successo!');
    }
  }
}

