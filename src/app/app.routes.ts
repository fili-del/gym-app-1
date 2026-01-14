import { Routes } from '@angular/router';
import SessionCreatorComponent from './components/session-creator.component';
import HistoryListComponent from './components/history-list.component';
import ExerciseDetailComponent from './components/exercise-detail.component';
import { ExerciseListComponent } from './components/exercise-list.component';

export const routes: Routes = [
    { path: '', component: ExerciseListComponent },
    { path: 'session/new', component: SessionCreatorComponent },
    { path: 'history', component: HistoryListComponent },
    { path: 'exercise/:id', component: ExerciseDetailComponent }
];
