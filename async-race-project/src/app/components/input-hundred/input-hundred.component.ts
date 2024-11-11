import { Component } from '@angular/core';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-input-hundred',
  standalone: true,
  imports: [],
  templateUrl: './input-hundred.component.html',
  styleUrl: './input-hundred.component.css',
})
export class InputHundredComponent {
  userText = '';
  userColor = '#000000';
  constructor(private carService: CarService) {}

  generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  generateCars(count: number): void {
    for (let i = 0; i < count; i++) {
      const newCar = { name: `Car ${i + 1}`, color: this.getRandomColor() };
      this.carService.createCar(newCar).subscribe(() => {
        this.resetForm();
      });
    }
  }
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  resetForm(): void {
    this.userText = '';
    this.userColor = '#000000';
  }
}
