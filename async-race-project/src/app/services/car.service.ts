import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Car {
  id: number;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private carsSource = new BehaviorSubject<Car[]>([]);
  currentCars = this.carsSource.asObservable();

  private apiUrl = 'http://localhost:3000/garage';

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
}
