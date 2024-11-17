import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { ServiceId } from '../../services/service-id.service';

@Component({
  selector: 'app-input-update',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-update.component.html',
  styleUrl: './input-update.component.css',
})
export class InputUpdateComponent implements OnInit {
  @Input() isDisabled = false;

  selectedId: number | null = null;
  text = '';
  color = '#000000';
  selectedCar: null | undefined;

  constructor(
    private carService: CarService,
    private serviceId: ServiceId
  ) {}

  ngOnInit(): void {
    this.getIdFromService();
  }

  getIdFromService(): void {
    this.serviceId.selectedId$.subscribe((id) => {
      this.selectedId = id;
    });
  }

  updateCar(): void {
    if (!this.text) {
      alert('Please enter a car brand.');
      return;
    }
    if (this.selectedId !== null) {
      const updatedCar = { id: this.selectedId, name: this.text, color: this.color };
      this.carService.updateCar(updatedCar).subscribe((car) => {
        console.log('Car updated:', car);
        this.resetForm();
      });
    } else {
      alert('Choose the car for updating.');
    }
  }
  
  resetForm(): void {
    this.text = '';
    this.color = '#000000';
  }
}
