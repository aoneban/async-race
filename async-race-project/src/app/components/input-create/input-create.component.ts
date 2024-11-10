import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewCarDataService } from '../../services/newCarData.service';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-input-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-create.component.html',
  styleUrl: './input-create.component.css',
})
export class InputCreateComponent {
  userText = '';
  userColor = '#000000';

  constructor(
    private dataService: NewCarDataService,
    private carService: CarService
  ) {}

  generateUniqueId(): number { return Date.now() + Math.floor(Math.random() * 1000); }

  sendData() {
    const newCar = { id: this.generateUniqueId(), name: this.userText, color: this.userColor };
    console.log('Adding car:', newCar);
    this.carService.addCar(newCar);
    this.dataService.changeData({ text: this.userText, color: this.userColor });
  }
}
