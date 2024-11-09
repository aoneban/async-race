import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-update',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-update.component.html',
  styleUrl: './input-update.component.css'
})
export class InputUpdateComponent {
  text = '';
  color = '#000000';
  create() {
    console.log('Text:', this.text);
    console.log('Color:', this.color);
  }
}
