import { Component, OnInit } from '@angular/core';
import { NewCarDataService } from '../../services/newCarData.service';

@Component({
  selector: 'app-create-onecar',
  standalone: true,
  imports: [],
  templateUrl: './create-onecar.component.html',
  styleUrls: ['./create-onecar.component.css'],
})
export class CreateOneCarComponent implements OnInit {
  data: { text: string; color: string } = { text: '', color: '#000000' };

  constructor(private dataService: NewCarDataService) {}

  ngOnInit() {
    this.dataService.currentData.subscribe((data) => {
      this.data = data;
    });
  }
}
