import { Component } from '@angular/core';
import { CarService } from '../../services/car.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-engine-control',
  standalone: true,
  templateUrl: './engine-control.component.html',
  styleUrls: ['./engine-control.component.css'],
  imports: [CommonModule]
})
export class EngineControlComponent {
  constructor(private carService: CarService) {}

  startEngine(carId: number): void {
    this.carService.controlEngine(carId, 'started').subscribe((status) => {
      console.log('Engine started:', status);
    });
  }

  stopEngine(carId: number): void {
    this.carService.controlEngine(carId, 'stopped').subscribe((status) => {
      console.log('Engine stopped:', status);
    });
  }
}
