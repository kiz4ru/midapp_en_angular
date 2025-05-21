import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Web3Service, WalletInfo, NetworkStatus } from '../../services/web3.service';
import { ThemeService } from '../../services/theme.service';
import { ValueDisplayComponent } from '../value-display/value-display.component';
import { ValueFormComponent } from '../value-form/value-form.component';
import { RecentUpdatesComponent } from '../recent-updates/recent-updates.component';
import { WalletPromptComponent } from '../wallet-prompt/wallet-prompt.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    ValueDisplayComponent,
    ValueFormComponent,
    RecentUpdatesComponent,
    WalletPromptComponent
  ],
  template: `
    <div class="dashboard-container" [ngClass]="{'dark-theme': isDarkTheme}">
      <h1 class="page-title">Almacén de Valor en Blockchain</h1>
      
      <!-- Network Warning -->
      <div *ngIf="networkStatus?.isConnected && !networkStatus?.isCorrectNetwork" class="network-warning card">
        <mat-icon>warning</mat-icon>
        <p>Estás conectado a <strong>{{networkStatus?.network}}</strong>, la cual no es compatible. 
           Por favor, cambia a Ganache Local (localhost:7545) o Sepolia Testnet en MetaMask.</p>
      </div>
      
      <!-- Wallet Prompt -->
      <app-wallet-prompt *ngIf="!wallet"></app-wallet-prompt>
      
      <!-- Main Dashboard Content -->
      <div *ngIf="wallet" class="dashboard-content">
        <div class="dashboard-grid">
          <!-- Current Value Card -->
          <mat-card class="dashboard-card value-card fade-in">
            <mat-card-header>
              <mat-card-title>Valor Actual</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-value-display [currentValue]="currentValue" [isLoading]="isLoading"></app-value-display>
            </mat-card-content>
          </mat-card>
          
          <!-- Update Value Card -->
          <mat-card class="dashboard-card update-card fade-in" *ngIf="wallet.isAuthorized">
            <mat-card-header>
              <mat-card-title>Actualizar Valor</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-value-form 
                [isLoading]="isLoading" 
                (updateValue)="updateValue($event)">
              </app-value-form>
            </mat-card-content>
          </mat-card>
          
          <!-- Not Authorized Message -->
          <mat-card class="dashboard-card authorization-card fade-in" *ngIf="!wallet.isAuthorized">
            <mat-card-header>
              <mat-card-title>No Autorizado</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="not-authorized-message">
                <mat-icon color="warn">lock</mat-icon>
                <p>Tu billetera no está autorizada para actualizar valores. Por favor, contacta al propietario del contrato para solicitar autorización.</p>
              </div>
            </mat-card-content>
          </mat-card>
          
          <!-- Recent Updates Card -->
          <mat-card class="dashboard-card history-card fade-in">
            <mat-card-header>
              <mat-card-title>Actualizaciones Recientes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-recent-updates [userAddress]="wallet.address"></app-recent-updates>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem 0;
    }
    
    .page-title {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      text-align: center;
      color: var(--primary-color);
    }
    
    .network-warning {
      display: flex;
      align-items: center;
      background-color: #fff3e0;
      color: #e65100;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid #ff9800;
    }
    
    .dark-theme .network-warning {
      background-color: rgba(255, 152, 0, 0.15);
      border-left: 4px solid #ff9800;
    }
    
    .network-warning mat-icon {
      margin-right: 12px;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .dashboard-card {
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .dark-theme .dashboard-card {
      background-color: var(--card-bg-dark);
      color: var(--text-light);
    }
    
    .dark-theme .dashboard-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    
    .value-card mat-card-content {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .update-card, .authorization-card {
      min-height: 200px;
    }
    
    .history-card {
      grid-column: 1 / -1;
    }
    
    .not-authorized-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    
    .not-authorized-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem 0;
      }
      
      .page-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  wallet: WalletInfo | null = null;
  networkStatus: NetworkStatus | null = null;
  currentValue = '';
  isLoading = false;
  isDarkTheme = false;
  
  constructor(
    private web3Service: Web3Service,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    this.web3Service.wallet$.subscribe(wallet => {
      this.wallet = wallet;
    });
    
    this.web3Service.networkStatus$.subscribe(status => {
      this.networkStatus = status;
    });
    
    this.web3Service.currentValue$.subscribe(value => {
      this.currentValue = value;
      console.log(`DashboardComponent: currentValue property updated to: '${value}' via subscription.`);
    });
    
    this.web3Service.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
  
  updateValue(value: string): void {
    this.web3Service.setValue(value);
  }
}