import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterModule],
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}

/* import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

interface Car {
  id: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
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
 */
