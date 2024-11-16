import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private raceActiveSubjects: Record<number, BehaviorSubject<boolean>> = {};

  getRaceActive$(carId: number): Observable<boolean> {
    if (!this.raceActiveSubjects[carId]) {
      this.raceActiveSubjects[carId] = new BehaviorSubject<boolean>(false);
    }
    return this.raceActiveSubjects[carId].asObservable();
  }

  setRaceActive(carId: number, isActive: boolean) {
    if (!this.raceActiveSubjects[carId]) {
      this.raceActiveSubjects[carId] = new BehaviorSubject<boolean>(false);
    }
    this.raceActiveSubjects[carId].next(isActive);
  }
}


