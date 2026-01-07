export interface Set {
    reps: number;
    weightKg?: number;
    restSeconds?: number;
}

export interface WorkoutEntry {
    exerciseId: number;
    name: string;
    muscleGroup?: string;
    sets: Set[];
    notes?: string;
}

export interface Session {
    id: number;
    date: string; // ISO
    entries: WorkoutEntry[];
    notes?: string;
    durationMinutes?: number;
}
