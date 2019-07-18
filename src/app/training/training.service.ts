import {Injectable} from "@angular/core";
import { Subject } from 'rxjs';
import {AngularFirestore} from 'angularfire2/firestore'
import {Exercise} from './exercise.model';
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {UISrvice} from "../shared/ui.service";




@Injectable()

export class TrainingService {
    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;
    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore, private uiService: UISrvice) {}


    fetchAvailableExercises() {
        this.uiService.loadingStateChanged.next(true);
        this.fbSubs.push(
            this.db
                .collection('availableExercises')
                .snapshotChanges()
                .pipe(map(docArray => { //throw(new Error());
                        return docArray.map(doc => {
                            const ex_data = doc.payload.doc.data() as Exercise;
                            return {
                                id: doc.payload.doc.id,
                                name: ex_data.name,
                                duration: ex_data.duration,
                                calories: ex_data.calories,
                            };
                        })
                    })
                ).subscribe((exercises: Exercise[]) => {
                    this.uiService.loadingStateChanged.next(false);
                this.availableExercises = exercises;
                this.exercisesChanged.next([...this.availableExercises])
            }, error => {
                this.uiService.loadingStateChanged.next(false);
                this.uiService.showSnackbar('Exercises loading fails, please try again', null, 3000);
                this.exercisesChanged.next(null);
            })
        )
    }

    startExercise(selectedId: string) {
        // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()})
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise})
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    completeExercise() {
        this.addDataToDatabse({...this.runningExercise, date: new Date(), state: 'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }
    cancelExercise(progress: number) {
        this.addDataToDatabse({...this.runningExercise, duration: this.runningExercise.duration * (progress / 100), calories: this.runningExercise.calories * (progress / 100), date: new Date(), state: 'cancelled'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    fetchAllExercises() {
        this.fbSubs.push(
            this.db
                .collection('finishedExercises')
                .valueChanges()
                .subscribe((exercises: Exercise[]) => {
                    this.finishedExercisesChanged.next(exercises);
                })
        )

    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }


    private addDataToDatabse(exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }

}
