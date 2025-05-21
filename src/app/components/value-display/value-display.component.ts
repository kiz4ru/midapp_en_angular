import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'; // Import OnChanges and SimpleChanges
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-value-display',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="value-display">
      <div *ngIf="isLoading; else valueContent" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <ng-template #valueContent>
        <div class="current-value" [ngClass]="{'no-value': !currentValue}">
          {{ currentValue || 'Valor no establecido' }}
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .value-display {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
      width: 100%;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .current-value {
      font-size: 1.5rem;
      font-weight: 500;
      text-align: center;
      padding: 1rem;
      word-break: break-word;
    }
    
    .no-value {
      color: #9e9e9e;
      font-style: italic;
    }
  `]
})
export class ValueDisplayComponent implements OnChanges { // Implement OnChanges
  @Input() currentValue = '';
  @Input() isLoading = false;

  ngOnChanges(changes: SimpleChanges): void { // Add ngOnChanges
    if (changes['currentValue']) {
      console.log(`ValueDisplayComponent: ngOnChanges detected change in currentValue. New value: '${changes['currentValue'].currentValue}', Previous value: '${changes['currentValue'].previousValue}'`);
    }
    if (changes['isLoading']) {
      console.log(`ValueDisplayComponent: ngOnChanges detected change in isLoading. New value: '${changes['isLoading'].currentValue}', Previous value: '${changes['isLoading'].previousValue}'`);
    }
  }
}