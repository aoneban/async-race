import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaceStateService {
  private raceStarted: Record<number, BehaviorSubject<boolean>> = {};

  setRaceStarted(carId: number, started: boolean): void {
    if (!this.raceStarted[carId]) {
      this.raceStarted[carId] = new BehaviorSubject<boolean>(false);
    }
    this.raceStarted[carId].next(started);
  }

  isRaceStarted$(carId: number): Observable<boolean> {
    if (!this.raceStarted[carId]) {
      this.raceStarted[carId] = new BehaviorSubject<boolean>(false);
    }
    return this.raceStarted[carId].asObservable();
  }
}
