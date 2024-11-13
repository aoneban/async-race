import { Component, AfterViewInit, Input } from '@angular/core';
import { CarService } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

interface Car {
  id: number;
  name: string;
  color: string;
}

interface CarRace {
  id: number;
  name: string;
  startTime: number;
  endTime: number | null;
}

@Component({
  selector: 'app-engine-control',
  standalone: true,
  templateUrl: './engine-control.component.html',
  styleUrls: ['./engine-control.component.css'],
  imports: [CommonModule],
})
export class EngineControlComponent implements AfterViewInit {
  @Input() cars: Car[] = [];
  @Input() getCarName!: (carId: number) => string;

  private driveCheckSubscription: Subscription | null = null;
  private carElements: Record<number, HTMLElement> = {};
  private containerWidth = 0;
  private carRaces: CarRace[] = [];
  widthCar = 270;
  speedCoeff = 5;

  constructor(private carService: CarService) {}

  ngAfterViewInit(): void {
    const containerElement = document.querySelector('.cars-list');
    if (containerElement) {
      const styles = window.getComputedStyle(containerElement);
      const paddingLeft = parseFloat(styles.paddingLeft || '0');
      const paddingRight = parseFloat(styles.paddingRight || '0');
      this.containerWidth = containerElement.clientWidth - paddingLeft - paddingRight;
    }
  }

  drive(carId: number): void {
    const startTime = performance.now();
    const carName = this.getCarName(carId);
    this.carRaces.push({ id: carId, name: carName, startTime, endTime: null });

    this.carService.startEngine(carId).subscribe(
        (engineStatus) => {
            console.log('Start Engine Response:', engineStatus);
            this.animateCar(engineStatus.velocity, this.containerWidth - 270, carId);

            this.driveCheckSubscription = interval(2000).pipe(
                switchMap(() => this.carService.checkEngineStatus(carId)),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 500) {
                        this.stopAnimation(carId, true);
                    }
                    throw error;
                })
            ).subscribe(
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
      const duration = distance / (velocity * this.speedCoeff);
      carElement.style.transition = `transform ${duration}s linear`;
      carElement.style.transform = `translateX(${distance}px)`;
      carElement.addEventListener('transitionend', () => {
        console.log(`Animation finished for car ${carId}`);
        this.finishRace(carId);
      });
    } else {
      console.warn(`Car element with ID img-${carId} not found, skipping animation.`);
      this.finishRace(carId);
    }
  }

  stopAnimation(carId: number, error = false): void {
    const carElement = document.getElementById(`img-${carId}`);
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

  finishRace(carId: number): void {
    const endTime = performance.now();
    const race = this.carRaces.find((race) => race.id === carId);
    if (race) {
      race.endTime = endTime;
      const raceTime = (race.endTime - race.startTime) / 1000;
      console.log(`Car ${race.name} finished in ${raceTime.toFixed(2)} seconds`);
      const allFinished = this.carRaces.every((race) => race.endTime !== null);
      console.log('All cars finished check:', allFinished);
      if (allFinished) {
        console.log('All cars finished');
        this.declareWinner();
      }
    }
  }
  declareWinner(): void {
    const winner = this.carRaces.reduce((prev, curr) => (prev.endTime! < curr.endTime! ? prev : curr));
    const raceTime = (winner.endTime! - winner.startTime) / 1000;
    alert(`${winner.name} is the winner with a time of ${raceTime.toFixed(2)} seconds!`);
  }
}
