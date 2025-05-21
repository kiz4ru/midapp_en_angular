import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Web3Service, ValueRecord } from '../../services/web3.service';

@Component({
  selector: 'app-recent-updates',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule, DatePipe],
  providers: [DatePipe],
  template: `
    <div class="recent-updates">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>
      
      <div *ngIf="!isLoading && history.length === 0" class="no-history">
        <p>No se encontró historial de actualizaciones para esta billetera.</p>
      </div>
      
      <mat-list *ngIf="!isLoading && history.length > 0" class="history-list">
        <div *ngFor="let item of history; let i = index" class="history-item-container">
          <div class="history-item">
            <div class="history-icon">
              <div class="timeline-dot"></div>
              <div *ngIf="i < history.length - 1" class="timeline-line"></div>
            </div>
            <div class="history-content">
              <div class="history-value">{{item.value}}</div>
              <div class="history-timestamp">{{ item.timestamp * 1000 | date:'medium' }}</div>
            </div>
          </div>
        </div>
      </mat-list>
    </div>
  `,
  styles: [`
    .recent-updates {
      width: 100%;
      min-height: 200px;
    }
    
    .loading, .no-history {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #9e9e9e;
    }
    
    .history-list {
      padding: 0;
    }

    .history-item-container {
      position: relative;
    }

    .history-item {
      display: flex;
      padding: 16px 0;
      position: relative;
      z-index: 2;
    }
    
    .history-icon {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 16px;
      min-width: 24px;
      z-index: 1;
    }
    
    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--primary-color);
      z-index: 2;
      position: relative;
    }
    
    .timeline-line {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: calc(100% + 16px);
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    :host-context(.dark-theme) .timeline-line {
      background-color: #616161;
    }
    
    .history-content {
      flex: 1;
      padding-bottom: 8px;
    }
    
    .history-value {
      font-size: 1rem;
      word-break: break-word;
      font-weight: 500;
    }

    .history-timestamp {
      font-size: 0.8rem;
      color: #757575;
      margin-top: 4px;
    }

    :host-context(.dark-theme) .history-timestamp {
      color: #bdbdbd;
    }
  `]
})
export class RecentUpdatesComponent implements OnInit, OnChanges {
  @Input() userAddress: string = '';
  
  history: ValueRecord[] = [];
  isLoading = true;
  
  constructor(private web3Service: Web3Service, private datePipe: DatePipe) {}
  
  ngOnInit(): void {
    if (this.userAddress) {
        this.loadHistory();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userAddress'] && changes['userAddress'].currentValue) {
      this.loadHistory();
    }
  }
  
  async loadHistory(): Promise<void> {
    if (!this.userAddress) {
      this.isLoading = false;
      this.history = [];
      return;
    }
    
    this.isLoading = true;
    try {
      const rawHistory = await this.web3Service.getUserHistory(this.userAddress);
      this.history = rawHistory.map(record => ({
        ...record,
      })).reverse();
    } catch (error) {
      console.error('Error loading history in RecentUpdatesComponent:', error);
      this.history = [];
    } finally {
      this.isLoading = false;
    }
  }
}