import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';

interface Car {
  id: number;
  name: string;
  color: string;
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

  private apiUrl = 'http://localhost:3000/garage';
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

  controlEngine(id: number): Observable<{ engineStatus: EngineStatus; driveResponse: DriveResponse }> {
    const startParams = new HttpParams().set('id', id.toString()).set('status', 'started');
    const driveParams = new HttpParams().set('id', id.toString()).set('status', 'drive');
    return this.http.patch<EngineStatus>(`${this.apiUrlEngine}`, {}, { params: startParams }).pipe(
      tap((startResponse) => {
        console.log('Start Engine Response:', startResponse);
      }),
      switchMap((startResponse) =>
        this.http
          .patch<DriveResponse>(`${this.apiUrlEngine}`, {}, { params: driveParams })
          .pipe(map((driveResponse) => ({ engineStatus: startResponse, driveResponse })))
      )
    );
  }
}
