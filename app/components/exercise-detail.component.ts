import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { Set } from '../models/session';

declare const Chart: any;

interface ExerciseData {
    date: string;
    sets: Set[];
}

@Component({
    standalone: true,
    selector: 'exercise-detail',
    imports: [CommonModule, RouterModule],
    templateUrl: './exercise-detail.component.html',
    styleUrls: ['./exercise-detail.component.css']
})
export default class ExerciseDetailComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartReps') chartRepsRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('chartWeight') chartWeightRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('chartVolume') chartVolumeRef!: ElementRef<HTMLCanvasElement>;
    
    data: ExerciseData[] = [];
    name: string = '';
    muscleGroup: string = '';
    exerciseId: number = 0;
    private charts: any[] = [];

    constructor(private route: ActivatedRoute, private svc: WorkoutService) { }

    ngAfterViewInit(): void {
        this.exerciseId = Number(this.route.snapshot.paramMap.get('id')) || 0;
        const exercise = this.svc.getExerciseById(this.exerciseId);
        
        if (exercise) {
            this.name = exercise.name;
            this.muscleGroup = exercise.muscleGroup || '';
        }

        this.data = this.svc.getSessionsForExercise(this.exerciseId);
        
        if (this.data.length > 0 && typeof Chart !== 'undefined') {
            this.createCharts();
        }
    }

    ngOnDestroy(): void {
        this.charts.forEach(chart => chart.destroy());
    }

    private createCharts() {
        const labels = this.data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        }).reverse();

        // Chart Ripetizioni (media per sessione)
        const avgReps = this.data.map(d => {
            if (d.sets.length === 0) return 0;
            const total = d.sets.reduce((sum, set) => sum + set.reps, 0);
            return total / d.sets.length;
        }).reverse();

        if (this.chartRepsRef?.nativeElement) {
            const ctx = this.chartRepsRef.nativeElement.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Ripetizioni medie',
                        data: avgReps,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            this.charts.push(chart);
        }

        // Chart Peso (peso medio per sessione)
        const avgWeights = this.data.map(d => {
            const setsWithWeight = d.sets.filter(s => s.weightKg !== undefined && s.weightKg !== null);
            if (setsWithWeight.length === 0) return null;
            const total = setsWithWeight.reduce((sum, set) => sum + (set.weightKg || 0), 0);
            return total / setsWithWeight.length;
        }).reverse();

        if (this.chartWeightRef?.nativeElement) {
            const ctx = this.chartWeightRef.nativeElement.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Peso medio (kg)',
                        data: avgWeights,
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            this.charts.push(chart);
        }

        // Chart Volume (volume totale per sessione)
        const volumes = this.data.map(d => {
            let volume = 0;
            for (const set of d.sets) {
                if (set.weightKg && set.reps) {
                    volume += set.weightKg * set.reps;
                }
            }
            return volume;
        }).reverse();

        if (this.chartVolumeRef?.nativeElement) {
            const ctx = this.chartVolumeRef.nativeElement.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Volume totale (kg)',
                        data: volumes,
                        backgroundColor: 'rgba(102, 126, 234, 0.6)',
                        borderColor: '#667eea',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            this.charts.push(chart);
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getTotalVolume(sets: Set[]): number {
        let total = 0;
        for (const set of sets) {
            if (set.weightKg && set.reps) {
                total += set.weightKg * set.reps;
            }
        }
        return total;
    }

    getMaxWeight(sets: Set[]): number | null {
        const weights = sets
            .map(s => s.weightKg)
            .filter((w): w is number => w !== undefined && w !== null);
        return weights.length > 0 ? Math.max(...weights) : null;
    }

    getMaxWeightFromAll(): number | null {
        let maxWeight: number | null = null;
        for (const item of this.data) {
            const weight = this.getMaxWeight(item.sets);
            if (weight !== null && (maxWeight === null || weight > maxWeight)) {
                maxWeight = weight;
            }
        }
        return maxWeight;
    }

    getTotalReps(sets: Set[]): number {
        return sets.reduce((sum, set) => sum + set.reps, 0);
    }

    getTotalVolumeAllSessions(): number {
        let total = 0;
        for (const item of this.data) {
            total += this.getTotalVolume(item.sets);
        }
        return total;
    }
}
