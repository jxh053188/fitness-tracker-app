import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Subject } from "rxjs";
import { Exercise } from "./exercise.module";
import { map } from 'rxjs/operators'
import { Subscription } from "rxjs";

@Injectable()
export class TrainingService {
  changeExercise = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [ ];
  private runningExercise: Exercise;
  private firebaseSubs: Subscription[] = []

  constructor(private database: AngularFirestore) {}

  getAvailableExercises(){
    this.firebaseSubs.push(this.database
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(map(docArray => {
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories']
          };
        });
      }))
      .subscribe((exercises: Exercise[]) => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
      }, error=> {
        console.log(error)
      }));
  }

  startExercise(selectedId: string){
    this.database.doc('availableExercises/' + selectedId).update({lastSelected: new Date()})
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.changeExercise.next({...this.runningExercise});
  }

  getRunningExercise(){
    return {...this.runningExercise}
  }

  completeExercise(){
    this.addDataToDatabase({...this.runningExercise,
      date: new Date(),
      state: 'completed'});
    this.runningExercise = null;
    this.changeExercise.next(null);
  }

  cancelExercise(progress: number){
    this.addDataToDatabase({...this.runningExercise,
      date: new Date(),
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      state: 'cancelled'});
    this.runningExercise = null;
    this.changeExercise.next(null);

  }

  getCompletedExercises(){
    this.firebaseSubs.push(this.database.collection('finishedExercises').valueChanges().subscribe((exercises: Exercise[]) =>{
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  cancelSubscriptions(){
    this.firebaseSubs.forEach(sub => sub.unsubscribe())
  }

  private addDataToDatabase(exercise: Exercise){
    this.database.collection('finishedExercises').add(exercise)
  }
}
