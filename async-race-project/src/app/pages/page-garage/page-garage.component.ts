import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputCreateComponent } from '../../components/input-create/input-create.component';
import { InputUpdateComponent } from '../../components/input-update/input-update.component';

@Component({
  selector: 'app-page-garage',
  standalone: true,
  imports: [RouterModule, InputCreateComponent, InputUpdateComponent],
  templateUrl: './page-garage.component.html',
  styleUrl: './page-garage.component.css'
})
export class PageGarageComponent {
  title = 'async-race-app';
}
