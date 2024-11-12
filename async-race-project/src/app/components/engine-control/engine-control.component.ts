import { Component, AfterViewInit } from '@angular/core';
import { CarService } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-engine-control',
  standalone: true,
  templateUrl: './engine-control.component.html',
  styleUrls: ['./engine-control.component.css'],
  imports: [CommonModule],
})
export class EngineControlComponent implements AfterViewInit {
  private driveCheckSubscription: Subscription | null = null;
  private carElements: Record<number, HTMLElement> = {};
  private containerWidth = 0;
  widthCar = 270;
  speedCoeff = 5;

  constructor(private carService: CarService) {}

  ngAfterViewInit(): void {
    const containerElement = document.querySelector('.cars-list');
    if (containerElement) {
      this.containerWidth = containerElement.clientWidth;
    }
  }

  drive(carId: number): void {
    this.carService.startEngine(carId).subscribe(
      (engineStatus) => {
        console.log('Start Engine Response:', engineStatus);
        this.animateCar(engineStatus.velocity, this.containerWidth - this.widthCar, carId);
        this.driveCheckSubscription = interval(2000)
          .pipe(
            switchMap(() => this.carService.checkEngineStatus(carId)),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 500) {
                this.stopAnimation(carId, true);
              }
              throw error;
            })
          )
          .subscribe(
            (driveResponse) => {
              console.log('Drive status check passed:', driveResponse);
            },
            (error) => {
              console.error('Error checking engine status:', error);
              this.stopAnimation(carId, true);
            }
          );
      },
      (error) => {
        console.error('Error starting engine:', error);
      }
    );
  }
  animateCar(velocity: number, distance: number, carId: number): void {
    const carElement = document.getElementById(`img-${carId}`);
    if (carElement) {
      this.carElements[carId] = carElement;
      const duration = distance / (velocity * this.speedCoeff);
      carElement.style.transition = `transform ${duration}s linear`;
      carElement.style.transform = `translateX(${distance}px)`;
    }
  }
  stopAnimation(carId: number, error = false): void {
    const carElement = this.carElements[carId];
    if (carElement) {
      if (error) {
        const computedStyle = window.getComputedStyle(carElement);
        const matrix = new WebKitCSSMatrix(computedStyle.transform);
        const currentX = matrix.m41;
        carElement.style.transition = 'none';
        carElement.style.transform = `translateX(${currentX}px)`;
      } else {
        carElement.style.transition = 'none';
        carElement.style.transform = 'translateX(0)';
      }
      setTimeout(() => {
        carElement.style.transition = '';
      });
      if (this.driveCheckSubscription) {
        this.driveCheckSubscription.unsubscribe();
      }
    }
  }
}
