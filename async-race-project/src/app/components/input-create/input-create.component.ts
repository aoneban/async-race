import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-input-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-create.component.html',
  styleUrl: './input-create.component.css',
})

export class InputCreateComponent {
  @Input() isDisabled = false;
  userText = '';
  userColor = '#000000';

  constructor(private carService: CarService) {}

  createCar() {
    const newCar = { name: this.userText, color: this.userColor };
    this.carService.createCar(newCar).subscribe((car) => {
      console.log('Car created:', car);
      this.resetForm();
    });
  }
  resetForm(): void {
    this.userText = '';
    this.userColor = '#000000';
  }
}
