import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InputCreateComponent } from '../../components/input-create/input-create.component';
import { InputUpdateComponent } from '../../components/input-update/input-update.component';
import { InputHundredComponent } from '../../components/input-hundred/input-hundred.component';
import { CarService } from '../../services/car.service';
import { ServiceId } from '../../services/service-id.service';
import { EngineControlComponent } from '../../components/engine-control/engine-control.component';

interface Car {
  id: number;
  name: string;
  color: string;
}

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
  styleUrl: './page-garage.component.css',
})
export class PageGarageComponent implements OnInit {
  @ViewChild(EngineControlComponent) engineControl!: EngineControlComponent;

  title = 'async-race-app';
  cars: Car[] = [];
  currentPage = 1;
  itemsCarPages = 7;

  constructor(
    private carService: CarService,
    private serviceId: ServiceId
  ) {}

  ngOnInit(): void {
    this.carService.currentCars.subscribe((cars) => {
      this.cars = cars;
    });
  }

  drive(carId: number): void {
    if (this.engineControl) {
      this.engineControl.drive(carId);
    }
  }
  
  stopAnimation(carId: number): void {
    if (this.engineControl) {
      this.engineControl.stopAnimation(carId);
    }
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
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  deleteCar(id: number): void {
    this.carService.deleteCar(id).subscribe();
  }

  selectCar(carId: number) {
    this.serviceId.setSelectedId(carId);
  }
}
