import { Component, AfterViewInit } from '@angular/core';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-engine-control',
  standalone: true,
  templateUrl: './engine-control.component.html',
  styleUrls: ['./engine-control.component.css'],
  imports: [],
})
export class EngineControlComponent implements AfterViewInit {
  private carElement: HTMLElement | null = null;
  private containerWidth = 0;
  widthCar = 270;
  speedCoeff = 5;

  constructor(private carService: CarService) {}

  ngAfterViewInit(): void {
    const containerElement = document.querySelector('.cars-list');
    if (containerElement) {
      this.containerWidth = containerElement.clientWidth;
    }
  }

  drive(carId: number): void {
    this.carService.controlEngine(carId).subscribe(
      ({ engineStatus, driveResponse }) => {
        if (driveResponse.success) {
          this.animateCar(engineStatus.velocity, this.containerWidth - this.widthCar, carId);
        }
      },
      (error) => {
        console.error('Error engine to drive mode:', error);
      }
    );
  }
  animateCar(velocity: number, distance: number, carId: number): void {
    const carElement = document.getElementById(`img-${carId}`);
    if (carElement) {
      const duration = distance / (velocity * this.speedCoeff);
      carElement.style.transition = `transform ${duration}s linear`;
      carElement.style.transform = `translateX(${distance}px)`;
    }
  }
  stopAnimation(carId: number): void {
    const carElement = document.getElementById(`img-${carId}`);
    if (carElement) {
      carElement.style.transition = 'none';
      carElement.style.transform = 'translateX(0)';
      setTimeout(() => {
        if (this.carElement) {
          this.carElement.style.transition = '';
        }
      });
    }
  }
}
