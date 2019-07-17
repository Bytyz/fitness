import { Subject } from 'rxjs';

import {Exercise} from './exercise.model';

export class TrainingService {
    exerciseChanged = new Subject<Exercise>();

    private availableExercises: Exercise[] = [
        { id: 'running', name: 'Running', duration: 300, calories: 40 },
        { id: 'jumping', name: 'Jumping', duration: 30, calories: 15 },
        { id: 'swimming', name: 'Swimming', duration: 300, calories: 30 },
        { id: 'pushups', name: 'Pushups', duration: 60, calories: 20 }
    ];

    private runningExercise: Exercise;
    private exercises: Exercise[] = [];


    getAvailableExercises() {
        return this.availableExercises.slice();
    }

    startExercise(selectedId: string) {
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise})
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    completeExercise() {
        this.exercises.push({...this.runningExercise, date: new Date(), state: 'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }
    cancelExercise(progress: number) {
        this.exercises.push({...this.runningExercise, duration: this.runningExercise.duration * (progress / 100), calories: this.runningExercise.calories * (progress / 100), date: new Date(), state: 'cancelled'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getAllExercises() {
        return this.exercises.slice();
    }


};
