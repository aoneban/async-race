import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  imports: [MatDialogModule],
})
export class WinnerModalComponent {
  winnerName: string;
  raceTime: number;
  constructor(
    public dialogRef: MatDialogRef<WinnerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { winnerName: string; raceTime: number }
  ) {
    this.winnerName = data.winnerName;
    this.raceTime = data.raceTime;
  }
  close(): void {
    this.dialogRef.close();
  }
}
