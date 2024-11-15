import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  private raceActiveSubject = new BehaviorSubject<boolean>(false);
  raceActive$ = this.raceActiveSubject.asObservable();

  setRaceActive(isActive: boolean) {
    this.raceActiveSubject.next(isActive);
  }
  startRace(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }
}
