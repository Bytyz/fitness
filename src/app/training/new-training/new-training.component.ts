import {Component, OnDestroy, OnInit} from '@angular/core';
import {TrainingService} from "../training.service";
import {Exercise} from "../exercise.model";
import {NgForm} from "@angular/forms";
import {Subscription} from "rxjs";


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {UISrvice} from "../../shared/ui.service";

@Component({
    selector: 'app-new-training',
    templateUrl: './new-training.component.html',
    styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
    exercises: Exercise[];
    isLoading = true;
    private exerciseSubsctioption: Subscription;
    private loadingSubscription: Subscription;

    constructor(
        private trainingService: TrainingService,
        private uiService: UISrvice
    ) {}

    ngOnInit() {
        this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
            isLoading => {
                this.isLoading = isLoading;
        });
        this.exerciseSubsctioption = this.trainingService.exercisesChanged.subscribe(
            exercises => (
                this.exercises = exercises
            ));
        this.fetchExercises();
    }

    fetchExercises() {
        this.trainingService.fetchAvailableExercises();
    }

    onStartTraining(form: NgForm) {
        this.trainingService.startExercise(form.value.exercise);
    }

    ngOnDestroy() {
        if (this.exerciseSubsctioption) {
            this.exerciseSubsctioption.unsubscribe()
        }
        if (this.loadingSubscription) {
            this.loadingSubscription.unsubscribe()
        }
    }

}
