import { Component, Input } from '@angular/core';
import { CarService } from '../../services/car.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WinnerModalComponent } from '../modal/modal.component';
import { CarRace } from '../interfaces';

@Component({
  selector: 'app-winner-control',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './winner-control.component.html',
  styleUrls: ['./winner-control.component.css'],
})

export class WinnerControlComponent {
  @Input() carRaces: CarRace[] = [];
  @Input() errorCarIds = new Set<number>();

  private winnerDeclared = false;

  constructor(
    private carService: CarService,
    public dialog: MatDialog
  ) {}

  declareWinner(): void {
    if (this.winnerDeclared) {
      return;
    }

    const validRaces = this.carRaces.filter((race) => !this.errorCarIds.has(race.id) && race.endTime !== null);

    if (validRaces.length === 0) {
      this.openNoWinnerDialog();
      return;
    }

    const winner = validRaces.reduce((prev, curr) => {
      const prevTime = prev.endTime! - prev.startTime;
      const currTime = curr.endTime! - curr.startTime;
      return prevTime < currTime ? prev : curr;
    });
    const raceTime = (winner.endTime! - winner.startTime) / 1000;

    this.openWinnerDialog(winner.name, Number(raceTime.toFixed(3)));

    this.carService.checkWinnerExists(winner.id).subscribe((exists) => {
      if (exists) {
        this.carService.getWinner(winner.id).subscribe((existingWinner) => {
          const updatedWins = existingWinner.wins + 1;
          this.carService.updateWinner(winner.id, { wins: updatedWins, time: Number(raceTime.toFixed(3)) }).subscribe();
        });
      } else {
        this.carService.createWinner({ id: winner.id, wins: 1, time: Number(raceTime.toFixed(3)) }).subscribe();
      }
    });

    this.winnerDeclared = true;
  }

  openWinnerDialog(winnerName: string, raceTime: number): void {
    this.dialog.open(WinnerModalComponent, {
      data: { winnerName, raceTime },
    });
  }

  openNoWinnerDialog(): void {
    this.dialog.open(WinnerModalComponent, {
      data: { winnerName: 'No cars', raceTime: 0 },
    });
  }

  resetWinner(): void {
    this.winnerDeclared = false;
  }
}
