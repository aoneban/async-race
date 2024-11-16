import { Component, AfterViewInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { CarService } from '../../services/car.service';
import { RaceService } from '../../services/race.service';
import { WinnerControlComponent } from '../winner-control/winner-control.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Car {
  id: number;
  name: string;
}

interface CarRace {
  id: number;
  name: string;
  startTime: number;
  endTime: number | null;
}

interface DriveResponse {
  status: 'stopped' | 'completed' | string;
}

@Component({
  selector: 'app-engine-control',
  standalone: true,
  templateUrl: './engine-control.component.html',
  styleUrls: ['./engine-control.component.css'],
  imports: [CommonModule, WinnerControlComponent],
})
export class EngineControlComponent implements AfterViewInit, OnDestroy {
  @Input() cars: Car[] = [];
  @Input() getCarName!: (carId: number) => string;
  @ViewChild(WinnerControlComponent) winnerControl!: WinnerControlComponent;

  private driveCheckSubscription: Subscription | null = null;
  private containerWidth = 0;
  public carRaces: CarRace[] = [];
  public errorCarIds = new Set<number>();
  public activeCarIds = new Set<number>();
  widthCar = 255;
  speedCoeff = 5;
  seconds = 1000;

  constructor(
    private carService: CarService,
    private raceService: RaceService
  ) {}

  ngAfterViewInit(): void {
    const containerElement = document.querySelector('.cars-list');
    if (containerElement) {
      const styles = window.getComputedStyle(containerElement);
      const paddingLeft = parseFloat(styles.paddingLeft || '0');
      const paddingRight = parseFloat(styles.paddingRight || '0');
      this.containerWidth = containerElement.clientWidth - paddingLeft - paddingRight;
    }
  }

  ngOnDestroy(): void {
    this.clearDriveCheckSubscription();
  }

  startNewRace(): void {
    this.resetRace();
    this.cars.forEach((car) => this.drive(car.id));
  }

  drive(carId: number): void {
    if (this.activeCarIds.has(carId)) {
      console.log(`Car ${carId} is already in a race.`);
      return;
    }

    this.activeCarIds.add(carId);
    const carName = this.getCarName(carId);
    const existingRace = this.carRaces.find((race) => race.id === carId);

    if (!existingRace) {
      const startTime = performance.now();
      this.carRaces.push({ id: carId, name: carName, startTime, endTime: null });
    }

    this.carService.startEngine(carId).subscribe(
      (engineStatus) => {
        this.raceService.setRaceActive(carId, true);
        this.animateCar(engineStatus.velocity, this.containerWidth - this.widthCar, carId);

        this.driveCheckSubscription = interval(2000)
          .pipe(
            switchMap(() => this.carService.checkEngineStatus(carId)),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 500) {
                console.error(`Error 500 for car ${carId}: Engine failure.`);
                this.errorCarIds.add(carId);
                this.stopAnimation(carId, true);
                this.clearDriveCheckSubscription();
                this.raceService.setRaceActive(carId, false);
              }
              throw error;
            })
          )
          .subscribe({
            next: (response) => {
              const driveResponse = response as unknown as DriveResponse;
              if (driveResponse.status === 'stopped' || driveResponse.status === 'completed') {
                this.stopAnimation(carId);
                this.clearDriveCheckSubscription();
                this.raceService.setRaceActive(carId, false);
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error(`Error checking engine status for car ${carId}:`, error);
              this.errorCarIds.add(carId);
              this.stopAnimation(carId, true);
              this.clearDriveCheckSubscription();
              this.raceService.setRaceActive(carId, false);
            },
          });
      },
      (error) => {
        console.error(`Error starting engine for car ${carId}:`, error);
        this.errorCarIds.add(carId);
        this.activeCarIds.delete(carId);
      }
    );
  }

  private clearDriveCheckSubscription() {
    if (this.driveCheckSubscription) {
      this.driveCheckSubscription.unsubscribe();
      this.driveCheckSubscription = null;
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
        carElement.style.transform = `translateX(0)`;
      }

      setTimeout(() => {
        carElement.style.transition = '';
      });

      this.clearDriveCheckSubscription();
      this.raceService.setRaceActive(carId, false);
    }
    this.activeCarIds.delete(carId);
  }

  animateCar(velocity: number, distance: number, carId: number): void {
    const carElement = document.getElementById(`img-${carId}`);
    if (carElement) {
      const duration = distance / (velocity * this.speedCoeff);
      carElement.style.transition = `transform ${duration}s linear`;
      carElement.style.transform = `translateX(${distance}px)`;
      carElement.addEventListener('transitionend', () => {
        this.finishRace(carId);
        this.raceService.setRaceActive(carId, false);
      });
    } else {
      this.finishRace(carId);
      this.raceService.setRaceActive(carId, false);
    }
  }

  finishRace(carId: number): void {
    const endTime = performance.now();
    const race = this.carRaces.find((race) => race.id === carId);
    if (race) {
      race.endTime = endTime;

      const allFinished = this.cars.every(
        (car) => this.carRaces.some((race) => race.id === car.id) || this.errorCarIds.has(car.id)
      );
      if (allFinished) {
        this.winnerControl.declareWinner();
      }
    }
    this.clearDriveCheckSubscription();
    this.raceService.setRaceActive(carId, false);
  }


  resetRace(): void {
    this.carRaces = [];
    this.errorCarIds = new Set();
    this.activeCarIds = new Set();
    this.winnerControl.resetWinner();
    this.clearDriveCheckSubscription();
  }
}
