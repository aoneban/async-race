import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InputCreateComponent } from '../../components/input-create/input-create.component';
import { InputUpdateComponent } from '../../components/input-update/input-update.component';

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
  getUrl = 'http://localhost:3000';
  path = {
    garage: '/garage',
    engine: '/engine',
  };
  cars: Car[] = [];

  async getCars(): Promise<Car[]> {
    const result = await fetch(`${this.getUrl}${this.path.garage}`);
    const data = await result.json();
    return data as Car[];
  }

  async ngOnInit() {
    this.cars = await this.getCars();
  }
}
