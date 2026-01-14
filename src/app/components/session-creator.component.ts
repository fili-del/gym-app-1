import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ToastService } from '../services/toast.service';
import { Exercise } from '../models/exercise';
import { Session, WorkoutEntry, Set } from '../models/session';

@Component({
    standalone: true,
    selector: 'session-creator',
    imports: [CommonModule, FormsModule],
    templateUrl: './session-creator.component.html',
    styleUrls: ['./session-creator.component.css']
})
export default class SessionCreatorComponent {
    exercises: Exercise[] = [];
    entries: WorkoutEntry[] = [];
    notes: string = '';
    durationMinutes: number = 0;

    constructor(
        private svc: WorkoutService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.exercises = this.svc.getExercises();
    }

    addExercise() {
        if (this.exercises.length === 0) {
            this.toastService.warning('Aggiungi prima degli esercizi dalla lista principale!');
            return;
        }
        const ex = this.exercises[0];
        const entry: WorkoutEntry = {
            exerciseId: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: [{ reps: ex.reps || 8, weightKg: ex.weightKg }],
            notes: ''
        };
        this.entries.push(entry);
    }

    removeEntry(index: number) {
        this.entries.splice(index, 1);
    }

    onExerciseChange(entry: WorkoutEntry) {
        const ex = this.exercises.find(x => x.id === entry.exerciseId);
        if (!ex) return;
        entry.name = ex.name;
        entry.muscleGroup = ex.muscleGroup;
        if (entry.sets.length === 0) {
            entry.sets = [{ reps: ex.reps || 8, weightKg: ex.weightKg }];
        }
    }

    addSet(entry: WorkoutEntry) {
        const lastSet = entry.sets[entry.sets.length - 1];
        entry.sets.push({
            reps: lastSet?.reps || 8,
            weightKg: lastSet?.weightKg
        });
    }

    removeSet(entry: WorkoutEntry, setIndex: number) {
        if (entry.sets.length > 1) {
            entry.sets.splice(setIndex, 1);
        } else {
            this.toastService.warning('Ogni esercizio deve avere almeno una serie!');
        }
    }

    save() {
        if (this.entries.length === 0) {
            this.toastService.warning('Aggiungi almeno un esercizio alla sessione.');
            return;
        }

        // Validazione: ogni entry deve avere almeno una serie
        for (const entry of this.entries) {
            if (entry.sets.length === 0) {
                this.toastService.warning(`L'esercizio "${entry.name}" deve avere almeno una serie!`);
                return;
            }
        }

        const session: Session = {
            id: 0,
            date: new Date().toISOString(),
            entries: this.entries.map(e => ({
                ...e,
                sets: e.sets.map(s => ({ ...s }))
            })),
            notes: this.notes,
            durationMinutes: this.durationMinutes || undefined
        };
        this.svc.saveSession(session);
        this.toastService.success('Sessione salvata con successo! 🎉');
        this.router.navigate(['/history']);
    }

    cancel() {
        if (confirm('Sei sicuro di voler annullare? I dati inseriti verranno persi.')) {
            this.router.navigate(['/']);
        }
    }
}
