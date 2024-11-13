import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

interface Car {
  id: number;
  name: string;
  color: string;
}

interface Winner {
  id: number;
  wins: number;
  time: number;
}

interface EngineStatus {
  velocity: number;
  distance: number;
}

interface DriveResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private carsSource = new BehaviorSubject<Car[]>([]);
  currentCars = this.carsSource.asObservable();
  private winnersSource = new BehaviorSubject<Winner[]>([]);
  currentWinners = this.winnersSource.asObservable();

  private apiUrl = 'http://localhost:3000/garage';
  private apiUrlWinner = 'http://localhost:3000/winners';
  private apiUrlEngine = 'http://localhost:3000/engine';

  constructor(private http: HttpClient) {
    this.loadInitialCars();
  }

  loadInitialCars() {
    this.getCarsFromApi().subscribe((cars) => this.carsSource.next(cars));
  }

  getCarsFromApi(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl).pipe(tap((cars) => this.carsSource.next(cars)));
  }

  addCar(car: Car) {
    const currentCars = this.carsSource.value;
    this.carsSource.next([...currentCars, car]);
  }

  createCar(car: { name: string; color: string }): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car).pipe(
      tap((newCar) => {
        const currentCars = this.carsSource.value;
        this.carsSource.next([...currentCars, newCar]);
      })
    );
  }

  deleteCar(id: number): Observable<object> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentCars = this.carsSource.value;
        const updatedCars = currentCars.filter((car) => car.id !== id);
        this.carsSource.next(updatedCars);
      })
    );
  }

  updateCar(updatedCar: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${updatedCar.id}`, updatedCar).pipe(
      tap((newCar) => {
        const currentCars = this.carsSource.value;
        const updatedCars = currentCars.map((car) => (car.id === updatedCar.id ? newCar : car));
        this.carsSource.next(updatedCars);
      })
    );
  }

  startEngine(id: number): Observable<EngineStatus> {
    const params = new HttpParams().set('id', id.toString()).set('status', 'started');
    return this.http.patch<EngineStatus>(`${this.apiUrlEngine}`, {}, { params });
  }

  checkEngineStatus(id: number): Observable<DriveResponse | HttpErrorResponse> {
    const params = new HttpParams().set('id', id.toString()).set('status', 'drive');
    return this.http
      .patch<DriveResponse>(`${this.apiUrlEngine}`, {}, { params })
      .pipe(catchError((error: HttpErrorResponse) => throwError(error)));
  }

  checkWinnerExists(id: number): Observable<boolean> {
    return this.http.get<Winner>(`${this.apiUrlWinner}/${id}`).pipe(
      map(() => true),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(false);
        }
        throw error;
      })
    );
  }

  createWinner(winnerData: { id: number; wins: number; time: number }): Observable<Winner> {
    return this.checkWinnerExists(winnerData.id).pipe(
      switchMap((exists) => {
        if (exists) {
          return this.updateWinner(winnerData.id, winnerData);
        } else {
          return this.http.post<Winner>(this.apiUrlWinner, winnerData).pipe(
            tap((newWinner) => {
              const currentWinners = this.winnersSource.value;
              this.winnersSource.next([...currentWinners, newWinner]);
            })
          );
        }
      })
    );
  }

  updateWinner(id: number, winnerData: { wins: number; time: number }): Observable<Winner> {
    return this.http.patch<Winner>(`${this.apiUrlWinner}/${id}`, winnerData).pipe(
      tap(() => {
        const currentWinners = this.winnersSource.value.map((winner) =>
          winner.id === id ? { ...winner, ...winnerData } : winner
        );
        this.winnersSource.next(currentWinners);
      })
    );
  }
}
