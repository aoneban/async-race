import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CarService } from '../../services/car.service';

export interface WinnersList {
  id: number;
  name: string;
  position: number;
  wins: number;
  time: number;
}

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
  displayedColumns: string[] = ['position', 'car', 'name', 'wins', 'time'];
  dataSource = new MatTableDataSource<WinnersList>();
  constructor(private carService: CarService) {}

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit() {
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
      const formattedWinners: WinnersList[] = winners.map((winner, index) => ({
        id: winner.id,
        name: `Name ${winner.id}`,
        car: `Car ${winner.id}`,
        position: index + 1,
        wins: winner.wins,
        time: winner.time,
      }));
      this.dataSource.data = formattedWinners;
      console.log(`Здесь вывод${this.dataSource}`);
    });
  }
}
