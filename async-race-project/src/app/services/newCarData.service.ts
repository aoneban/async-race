import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CarData {
  id?: number;
  text: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewCarDataService {
  private dataSource = new BehaviorSubject<CarData>({ text: '', color: '#000000' });
  currentData = this.dataSource.asObservable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  changeData(data: CarData) {
    this.dataSource.next(data);
  }
}
