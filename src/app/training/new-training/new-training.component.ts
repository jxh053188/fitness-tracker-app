import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Exercise } from '../exercise.module';
import { TrainingService } from '../training.service';
import { Observable , Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy{
  @Output() trainingStart = new EventEmitter<void>();
  exercises: Exercise[] = [];
  exerciseSub: Subscription

  constructor(private trainingService: TrainingService) { }

  ngOnInit() {
    /*this.trainingService.getAvailableExercises().subscribe(
      (result) => {
        this.exercises = result;
      }
    )*/
    this.exerciseSub = this.trainingService.exercisesChanged.subscribe(exercises => (this.exercises = exercises));
    this.trainingService.getAvailableExercises();
    console.log(this.exercises)
  }

  ngOnDestroy(): void {
    this.exerciseSub.unsubscribe();
  }

  onStartTraining(form: NgForm){
    this.trainingService.startExercise(form.value.exercise);
  }

}
