import { Injectable } from '@angular/core';
import { Exercise } from '../models/exercise';
import { Session, WorkoutEntry, Set } from '../models/session';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
    private STORAGE_KEY_SESSIONS = 'gym.sessions.v1';
    private STORAGE_KEY_EXERCISES = 'gym.exercises.v1';
    private sessions: Session[] = [];
    private exercises: Exercise[] = [];

    private defaultExercises: Exercise[] = [
        {
            id: 1,
            name: 'Panca piana con bilanciere',
            muscleGroup: 'petto',
            sets: 3,
            reps: 8,
            weightKg: 50,
            notes: 'Focus sulla tecnica, niente rimbalzi'
        },
        {
            id: 2,
            name: 'Lat machine avanti',
            muscleGroup: 'schiena',
            sets: 3,
            reps: 10,
            weightKg: 40,
            notes: 'Tirare al petto senza slanci'
        },
        {
            id: 3,
            name: 'Squat al multipower',
            muscleGroup: 'gambe',
            sets: 4,
            reps: 8,
            weightKg: 60,
            notes: 'Scendere almeno a parallelo'
        },
        {
            id: 4,
            name: 'Curl manubri in piedi',
            muscleGroup: 'bicipiti',
            sets: 3,
            reps: 12,
            weightKg: 10
        },
        {
            id: 5,
            name: 'French press bilanciere EZ',
            muscleGroup: 'tricipiti',
            sets: 3,
            reps: 10,
            weightKg: 25
        },
        {
            id: 6,
            name: 'Plank',
            muscleGroup: 'core',
            sets: 3,
            reps: 30,
            notes: '30 secondi a serie'
        }
    ];

    constructor() {
        // Load sessions
        const rawSessions = localStorage.getItem(this.STORAGE_KEY_SESSIONS);
        if (rawSessions) {
            try {
                this.sessions = JSON.parse(rawSessions) as Session[];
            } catch (e) {
                this.sessions = [];
            }
        }

        // Load exercises
        const rawExercises = localStorage.getItem(this.STORAGE_KEY_EXERCISES);
        if (rawExercises) {
            try {
                this.exercises = JSON.parse(rawExercises) as Exercise[];
            } catch (e) {
                this.exercises = [...this.defaultExercises];
                this.persistExercises();
            }
        } else {
            this.exercises = [...this.defaultExercises];
            this.persistExercises();
        }
    }

    getExercises(): Exercise[] {
        return this.exercises.slice();
    }

    saveExercise(exercise: Exercise): void {
        if (exercise.id === 0) {
            // New exercise
            const maxId = this.exercises.length > 0 
                ? Math.max(...this.exercises.map(e => e.id))
                : 0;
            exercise.id = maxId + 1;
            this.exercises.push(exercise);
        } else {
            // Update existing
            const index = this.exercises.findIndex(e => e.id === exercise.id);
            if (index !== -1) {
                this.exercises[index] = exercise;
            }
        }
        this.persistExercises();
    }

    deleteExercise(id: number): void {
        this.exercises = this.exercises.filter(e => e.id !== id);
        this.persistExercises();
    }

    saveSession(session: Session) {
        if (session.id === 0) {
            // New session
            const maxId = this.sessions.length > 0 
                ? Math.max(...this.sessions.map(s => s.id))
                : 0;
            session.id = maxId + 1;
            this.sessions.unshift(session);
        } else {
            // Update existing session
            const index = this.sessions.findIndex(s => s.id === session.id);
            if (index !== -1) {
                this.sessions[index] = session;
            }
        }
        this.persist();
    }

    updateSession(session: Session): void {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
            this.sessions[index] = { ...session };
            this.persist();
        }
    }

    deleteSession(id: number): void {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.persist();
    }

    getSessionById(id: number): Session | undefined {
        return this.sessions.find(s => s.id === id);
    }

    getSessions(): Session[] {
        return this.sessions.slice();
    }

    getSessionsForExercise(exerciseId: number): { date: string; sets: Set[] }[] {
        const result: { date: string; sets: Set[] }[] = [];
        for (const s of this.sessions) {
            for (const e of s.entries) {
                if (e.exerciseId === exerciseId) {
                    result.push({ date: s.date, sets: e.sets });
                }
            }
        }
        return result;
    }

    getExerciseById(id: number): Exercise | undefined {
        return this.exercises.find(e => e.id === id);
    }

    private persist() {
        localStorage.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(this.sessions));
    }

    private persistExercises() {
        localStorage.setItem(this.STORAGE_KEY_EXERCISES, JSON.stringify(this.exercises));
    }
}
