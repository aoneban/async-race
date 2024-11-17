import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InputCreateComponent } from '../../components/input-create/input-create.component';
import { InputUpdateComponent } from '../../components/input-update/input-update.component';
import { InputHundredComponent } from '../../components/input-hundred/input-hundred.component';
import { CarService } from '../../services/car.service';
import { ServiceId } from '../../services/service-id.service';
import { EngineControlComponent } from '../../components/engine-control/engine-control.component';
import { RaceService } from '../../services/race.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { RaceStateService } from '../../services/state.service';
import { Car } from '../../components/interfaces';

@Component({
  selector: 'app-page-garage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InputCreateComponent,
    InputUpdateComponent,
    InputHundredComponent,
    EngineControlComponent,
  ],
  templateUrl: './page-garage.component.html',
  styleUrls: ['./page-garage.component.css'],
})
export class PageGarageComponent implements OnInit {
  @ViewChild(EngineControlComponent) engineControl!: EngineControlComponent;

  title = 'async-race-app';
  cars: Car[] = [];
  currentPage = 1;
  itemsCarPages = 7;
  private readonly STORAGE_KEY = 'currentPage';
  @Input() carId!: number;
  isRaceActive$: Record<number, BehaviorSubject<boolean>> = {};
  anyRaceActive$ = new BehaviorSubject<boolean>(false);
  anyRaceActive = false;

  constructor(
    private carService: CarService,
    private serviceId: ServiceId,
    private raceService: RaceService,
    public raceStateService: RaceStateService
  ) {}

  ngOnInit(): void {
    this.carService.currentCars.subscribe((cars) => {
      this.cars = cars;
      this.cars.forEach((car) => {
        this.isRaceActive$[car.id] = new BehaviorSubject<boolean>(false);
        this.raceService.getRaceActive$(car.id).subscribe((isActive) => {
          this.isRaceActive$[car.id].next(isActive);
          this.updateAnyRaceActive();
        });
      });
    });
    const storedPage = localStorage.getItem(this.STORAGE_KEY);
    if (storedPage) {
      this.currentPage = parseInt(storedPage, 10);
    }
    this.anyRaceActive$.subscribe((active) => {
      this.anyRaceActive = active;
    });
  }

  private updateAnyRaceActive(): void {
    const anyActive = Object.values(this.isRaceActive$).some((subject) => subject.value);
    this.anyRaceActive$.next(anyActive);
    console.log(`Any race active: ${anyActive}`);
  }

  isRaceActive(carId: number): Observable<boolean> {
    return this.isRaceActive$[carId].asObservable();
  }

  drive(carId: number): void {
    if (this.engineControl) {
      this.engineControl.drive(carId);
    }
  }

  driveAll(): void {
    this.engineControl.startNewRace();
  }

  stopAnimation(carId: number): void {
    if (this.engineControl) {
      this.engineControl.stopAnimation(carId);
      this.isRaceActive$[carId].next(false);
      this.updateAnyRaceActive();
    }
  }

  stopAllAnimations(): void {
    this.cars.forEach((car) => {
      this.stopAnimation(car.id);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.cars.length / this.itemsCarPages);
  }

  get paginatedCars(): Car[] {
    const startIndex = (this.currentPage - 1) * this.itemsCarPages;
    const endIndex = startIndex + this.itemsCarPages;
    return this.cars.slice(startIndex, endIndex);
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.saveCurrentPage();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.saveCurrentPage();
    }
  }

  saveCurrentPage(): void {
    localStorage.setItem(this.STORAGE_KEY, this.currentPage.toString());
  }

  deleteCar(id: number): void {
    this.carService.deleteCar(id).subscribe(() => {
      this.cars = this.cars.filter((car) => car.id !== id);
      if (this.cars.length % 7 === 0) {
        this.currentPage--;
        if (this.currentPage === 0) {
          this.currentPage = 1;
        }
      }
    });
  }

  selectCar(carId: number) {
    this.serviceId.setSelectedId(carId);
  }

  getCarName(carId: number): string {
    const car = this.cars.find((c) => c.id === carId);
    const carName = car ? car.name : 'Unknown Car';
    return carName;
  }

  onCarsGenerated(newCars: Car[]): void {
    this.cars = newCars;
    console.log(`Generated ${newCars.length} cars.`);
  }
  
}
