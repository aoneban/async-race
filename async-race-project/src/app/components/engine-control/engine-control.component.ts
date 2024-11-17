import { Component, AfterViewInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subscription, forkJoin, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { CarService } from '../../services/car.service';
import { RaceService } from '../../services/race.service';
import { WinnerControlComponent } from '../winner-control/winner-control.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RaceStateService } from '../../services/state.service';
import { Car, CarRace, DriveResponse } from '../interfaces';

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

  private driveCheckSubscription = new Map<number, Subscription>();
  private containerWidth = 0;
  public carRaces: CarRace[] = [];
  public errorCarIds = new Set<number>();
  public activeCarIds = new Set<number>();
  widthCar = 255;
  speedCoeff = 5;
  seconds = 1000;

  constructor(
    private carService: CarService,
    private raceService: RaceService,
    private raceStateService: RaceStateService
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
    this.clearDriveCheckSubscriptions();
  }

  startNewRace(): void {
    this.resetRace();

    const driveObservables = this.cars.map((car) => this.driveAllCars(car.id));
    forkJoin(driveObservables).subscribe(
      () => {
        console.log('All cars started successfully.');
      },
      (error) => {
        console.error('Error starting some races:', error);
      }
    );
  }

  driveAllCars(carId: number): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.activeCarIds.has(carId)) {
        console.warn(`Car ${carId} is already in a race.`);
        observer.error(`Car ${carId} is already in a race.`);
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
          this.raceStateService.setRaceStarted(carId, true);
          this.raceService.setRaceActive(carId, true);
          this.animateCar(engineStatus.velocity, this.containerWidth - this.widthCar, carId);

          const driveCheckSub = interval(2200)
            .pipe(
              switchMap(() => this.raceService.getRaceActive$(carId)),
              switchMap((isActive) => {
                if (isActive) {
                  return this.carService.checkEngineStatus(carId);
                } else {
                  return of(null);
                }
              }),
              catchError((error: HttpErrorResponse) => {
                if (error.status === 500) {
                  console.error(`Error 500 for car ${carId}: Engine failure.`);
                  this.errorCarIds.add(carId);
                  this.stopAnimation(carId, true);
                  this.clearDriveCheckSubscription(carId);
                  this.raceStateService.setRaceStarted(carId, false);
                }
                return of(null);
              })
            )
            .subscribe({
              next: (response) => {
                if (response) {
                  const driveResponse = response as unknown as DriveResponse;
                  if (driveResponse.status === 'stopped' || driveResponse.status === 'completed') {
                    this.stopAnimation(carId);
                    this.clearDriveCheckSubscription(carId);
                    this.raceStateService.setRaceStarted(carId, false);
                    observer.next();
                    observer.complete();
                  }
                }
              },
              error: (error: HttpErrorResponse) => {
                console.error(`Error checking engine status for car ${carId}:`, error);
                this.errorCarIds.add(carId);
                this.stopAnimation(carId, true);
                this.clearDriveCheckSubscription(carId);
                this.raceStateService.setRaceStarted(carId, false);
                observer.error(error);
              },
            });

          this.driveCheckSubscription.set(carId, driveCheckSub);
        },
        (error) => {
          console.error(`Error starting engine for car ${carId}:`, error);
          this.errorCarIds.add(carId);
          this.activeCarIds.delete(carId);
          this.raceStateService.setRaceStarted(carId, false);
          observer.error(error);
        }
      );
    });
  }

  drive(carId: number): void {
    if (this.activeCarIds.has(carId)) {
      console.warn(`Car ${carId} is already in a race.`);
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
        this.raceStateService.setRaceStarted(carId, true);
        this.raceService.setRaceActive(carId, true);
        this.animateCar(engineStatus.velocity, this.containerWidth - this.widthCar, carId);

        const driveCheckSub = interval(3000)
          .pipe(
            switchMap(() => this.raceService.getRaceActive$(carId)),
            switchMap((isActive) => {
              if (isActive) {
                return this.carService.checkEngineStatus(carId);
              } else {
                return of(null);
              }
            }),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 500) {
                console.error(`Error 500 for car ${carId}: Engine failure.`);
                this.errorCarIds.add(carId);
                this.stopAnimation(carId, true);
                this.clearDriveCheckSubscription(carId);
                this.raceStateService.setRaceStarted(carId, false);
              }
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response) {
                const driveResponse = response as unknown as DriveResponse;
                if (driveResponse.status === 'stopped' || driveResponse.status === 'completed') {
                  this.stopAnimation(carId);
                  this.clearDriveCheckSubscription(carId);
                  this.raceStateService.setRaceStarted(carId, false);
                }
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error(`Error checking engine status for car ${carId}:`, error);
              this.errorCarIds.add(carId);
              this.stopAnimation(carId, true);
              this.clearDriveCheckSubscription(carId);
              this.raceStateService.setRaceStarted(carId, false);
            },
          });

        this.driveCheckSubscription.set(carId, driveCheckSub);
      },
      (error) => {
        console.error(`Error starting engine for car ${carId}:`, error);
        this.errorCarIds.add(carId);
        this.activeCarIds.delete(carId);
      }
    );
  }

  private clearDriveCheckSubscription(carId: number) {
    const subscription = this.driveCheckSubscription.get(carId);
    if (subscription) {
      subscription.unsubscribe();
      this.driveCheckSubscription.delete(carId);
    }
    this.raceService.setRaceActive(carId, false);
  }

  private clearDriveCheckSubscriptions() {
    this.driveCheckSubscription.forEach((subscription, carId) => {
      subscription.unsubscribe();
      this.raceService.setRaceActive(carId, false);
    });
    this.driveCheckSubscription.clear();
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
        this.raceStateService.setRaceStarted(carId, false);
      });

      this.clearDriveCheckSubscription(carId);
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
      });
    } else {
      this.finishRace(carId);
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
    this.clearDriveCheckSubscription(carId);
  }

  resetRace(): void {
    this.carRaces = [];
    this.errorCarIds = new Set();
    this.activeCarIds = new Set();
    this.winnerControl.resetWinner();
    this.clearDriveCheckSubscriptions();
  }
}
