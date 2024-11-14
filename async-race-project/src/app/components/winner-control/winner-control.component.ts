import { Component, Input } from '@angular/core';
import { CarService } from '../../services/car.service';

interface CarRace {
  id: number;
  name: string;
  startTime: number;
  endTime: number | null;
}

@Component({
  selector: 'app-winner-control',
  standalone: true,
  imports: [],
  templateUrl: './winner-control.component.html',
  styleUrls: ['./winner-control.component.css']
})

export class WinnerControlComponent {
  @Input() carRaces: CarRace[] = [];
  @Input() errorCarIds = new Set<number>();

  private winnerDeclared = false;

  constructor(private carService: CarService) {}

  declareWinner(): void {
    if (this.winnerDeclared) {
      return;
    }

    const validRaces = this.carRaces.filter((race) => !this.errorCarIds.has(race.id) && race.endTime !== null);
    console.log('Valid races:', validRaces);

    if (validRaces.length === 0) {
      alert('No cars finished without an error.');
      return;
    }

    const winner = validRaces.reduce((prev, curr) => {
      const prevTime = prev.endTime! - prev.startTime;
      const currTime = curr.endTime! - curr.startTime;
      return prevTime < currTime ? prev : curr;
    });
    const raceTime = (winner.endTime! - winner.startTime) / 1000;
    alert(`${winner.name} is the winner with a time of ${raceTime.toFixed(2)} seconds!`);

    this.carService.checkWinnerExists(winner.id).subscribe(exists => {
      if (exists) {
        this.carService.getWinner(winner.id).subscribe(existingWinner => {
          const updatedWins = existingWinner.wins + 1;
          this.carService.updateWinner(winner.id, { wins: updatedWins, time: Number(raceTime.toFixed(3)) }).subscribe();
        });
      } else {
        this.carService.createWinner({ id: winner.id, wins: 1, time: Number(raceTime.toFixed(3)) }).subscribe();
      }
    });

    this.winnerDeclared = true;
  }

  resetWinner(): void {
    this.winnerDeclared = false;
  }
}
