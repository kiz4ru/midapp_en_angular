import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Web3Service, WalletInfo } from '../../services/web3.service';
import { ThemeService } from '../../services/theme.service';
import { RecentUpdatesComponent } from '../recent-updates/recent-updates.component';
import { WalletPromptComponent } from '../wallet-prompt/wallet-prompt.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RecentUpdatesComponent,
    WalletPromptComponent
  ],
  template: `
    <div class="history-container" [ngClass]="{'dark-theme': isDarkTheme}">
      <h1 class="page-title">Historial de Actualización de Valor</h1>
      
      <!-- Wallet Prompt -->
      <app-wallet-prompt *ngIf="!wallet"></app-wallet-prompt>
      
      <!-- Main History Content -->
      <div *ngIf="wallet" class="history-content">
        <!-- Current Wallet History -->
        <mat-card class="history-card fade-in">
          <mat-card-header>
            <mat-card-title>Historial de Tu Billetera</mat-card-title>
            <mat-card-subtitle>
              Billetera: {{formatAddress(wallet.address)}}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-recent-updates [userAddress]="wallet.address"></app-recent-updates>
          </mat-card-content>
        </mat-card>
        
        <!-- Search Another Address -->
        <mat-card class="search-card fade-in">
          <mat-card-header>
            <mat-card-title>Ver Otra Dirección</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="search-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección Ethereum</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="searchAddress" 
                  placeholder="0x..." 
                  autocomplete="off">
                <mat-error *ngIf="addressError">
                  {{addressError}}
                </mat-error>
              </mat-form-field>
              
              <button 
                mat-raised-button 
                color="primary" 
                (click)="searchHistory()"
                [disabled]="isSearching">
                <span *ngIf="isSearching" class="spinner"></span>
                Buscar
              </button>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Search Results -->
        <mat-card *ngIf="showSearchResults" class="results-card fade-in">
          <mat-card-header>
            <mat-card-title>Resultados para {{formatAddress(searchedAddress)}}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-recent-updates [userAddress]="searchedAddress"></app-recent-updates>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 1.5rem 0;
    }
    
    .page-title {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      text-align: center;
      color: var(--primary-color);
    }
    
    .history-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .history-card, .search-card, .results-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .history-card:hover, .search-card:hover, .results-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .dark-theme .history-card, 
    .dark-theme .search-card, 
    .dark-theme .results-card {
      background-color: var(--card-bg-dark);
      color: var(--text-light);
    }
    
    .dark-theme .history-card:hover, 
    .dark-theme .search-card:hover, 
    .dark-theme .results-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .full-width {
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .history-container {
        padding: 1rem 0;
      }
      
      .page-title {
        font-size: A1.5rem;
        margin-bottom: 1rem;
      }
      
      .history-content {
        gap: 1rem;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  wallet: WalletInfo | null = null;
  isDarkTheme = false;
  searchAddress = '';
  searchedAddress = '';
  addressError = '';
  isSearching = false;
  showSearchResults = false;
  
  constructor(
    private web3Service: Web3Service,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    this.web3Service.wallet$.subscribe(wallet => {
      this.wallet = wallet;
    });
    
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
  
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  searchHistory(): void {
    // Reset previous states
    this.addressError = '';
    this.showSearchResults = false;
    
    // Validate address
    if (!this.searchAddress || this.searchAddress.trim() === '') {
      this.addressError = 'La dirección es requerida';
      return;
    }
    
    if (!this.searchAddress.startsWith('0x') || this.searchAddress.length !== 42) {
      this.addressError = 'Formato de dirección inválido. Debe comenzar con 0x y tener 42 caracteres.';
      return;
    }
    
    this.isSearching = true;
    
    // Set the searched address to trigger the update in the RecentUpdatesComponent
    this.searchedAddress = this.searchAddress;
    this.showSearchResults = true;
    this.isSearching = false;
  }
}