import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CarService, Car } from '../../services/car.service';
import { WinnersList } from '../../components/interfaces';

@Component({
  selector: 'app-page-winners',
  standalone: true,
  imports: [RouterModule, MatTableModule, MatSortModule, MatPaginatorModule, MatPaginator],
  templateUrl: './page-winners.component.html',
  styleUrl: './page-winners.component.css',
})

export class PageWinnersComponent implements AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);
  title = 'async-race-app';
  cars: Car[] = [];
  displayedColumns: string[] = ['id', 'car', 'name', 'wins', 'time'];
  dataSource = new MatTableDataSource<WinnersList>();
  constructor(private carService: CarService) {}

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit() {
    this.carService.currentCars.subscribe((cars) => (this.cars = cars));
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.getWinners();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  
  getWinners() {
    this.carService.getWinners().subscribe(({ winners }) => {
      const formattedWinners: WinnersList[] = winners
        .filter((winner) => this.cars.some((car) => car.id === winner.id))
        .map((winner, index) => ({
          id: winner.id,
          name: this.getCarProperty(winner.id, 'name'),
          car: this.getCarProperty(winner.id, 'color'),
          position: index + 1,
          wins: winner.wins,
          time: winner.time,
        }));
      this.dataSource.data = formattedWinners;
    });
  }

  getCarProperty(carId: number, property: 'name' | 'color'): string {
    const car = this.cars.find((c) => c.id === carId);
    return car ? car[property] : 'Car was deleted';
  }
}
