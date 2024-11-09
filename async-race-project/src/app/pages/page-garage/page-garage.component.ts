import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-garage',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './page-garage.component.html',
  styleUrl: './page-garage.component.css'
})
export class PageGarageComponent {
  title = 'async-race-app';
}
