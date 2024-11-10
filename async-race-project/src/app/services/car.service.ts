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
  providedIn: 'root'
})
export class CarService {
  private carsSource = new BehaviorSubject<Car[]>([]);
  currentCars = this.carsSource.asObservable();

  private apiUrl = 'http://localhost:3000/garage';

  constructor(private http: HttpClient) {
    this.loadInitialCars();
  }

  loadInitialCars() {
    this.getCarsFromApi().subscribe(cars => this.carsSource.next(cars));
  }

  getCarsFromApi(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl).pipe(
      tap(cars => this.carsSource.next(cars))
    );
  }

  addCar(car: Car) {
    const currentCars = this.carsSource.value;
    this.carsSource.next([...currentCars, car]);
  }
}
