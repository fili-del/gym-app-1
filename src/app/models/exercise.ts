export class Exercise {
  id: number = 0;
  name: string = '';
  muscleGroup: string = ''; // per ora semplice stringa: 'petto', 'schiena', ecc.
  sets: number = 0;
  reps: number = 0;
  weightKg?: number;
  notes?: string;
}