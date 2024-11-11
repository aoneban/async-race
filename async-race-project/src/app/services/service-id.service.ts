import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceId {
  private selectedId = new BehaviorSubject<number | null>(null);

  selectedId$ = this.selectedId.asObservable();

  setSelectedId(id: number) {
    this.selectedId.next(id);
  }
}
