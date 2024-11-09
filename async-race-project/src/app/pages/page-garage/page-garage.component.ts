import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InputCreateComponent } from '../../components/input-create/input-create.component';
import { InputUpdateComponent } from '../../components/input-update/input-update.component';
import { CarService } from '../../services/car.service';

interface Car {
  id: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-page-garage',
  standalone: true,
  imports: [CommonModule, RouterModule, InputCreateComponent, InputUpdateComponent],
  templateUrl: './page-garage.component.html',
  styleUrl: './page-garage.component.css',
})
export class PageGarageComponent implements OnInit {
  title = 'async-race-app';
  cars: Car[] = [];
  constructor(private carService: CarService) {}
  ngOnInit(): void {
    this.carService.getCars().subscribe((cars) => {
      this.cars = cars;
    });
  }
}
