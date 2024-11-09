import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-create.component.html',
  styleUrl: './input-create.component.css',
})
export class InputCreateComponent {
  text = '';
  color = '#000000';
  create() {
    console.log('Text:', this.text);
    console.log('Color:', this.color);
  }
}
