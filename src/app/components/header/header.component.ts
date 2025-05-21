import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Web3Service, NetworkStatus, WalletInfo } from '../../services/web3.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <mat-toolbar [ngClass]="{'dark-toolbar': isDarkTheme}">
      <div class="toolbar-container">
        <div class="app-title">
          <a routerLink="/" class="logo-link">
            <mat-icon>storage</mat-icon>
            <span>DApp Ethereum</span>
          </a>
        </div>
        
        <div class="nav-links">
          <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            Panel Principal
          </a>
          <a mat-button routerLink="/history" routerLinkActive="active-link">
            Historial
          </a>
          <a mat-button routerLink="/settings" routerLinkActive="active-link">
            Configuración
          </a>
        </div>
        
        <div class="action-buttons">
          <!-- Network Status -->
          <div class="network-status" *ngIf="networkStatus">
            <div class="status-indicator" 
                [ngClass]="{'connected': networkStatus.isConnected && networkStatus.isCorrectNetwork, 
                           'warning': networkStatus.isConnected && !networkStatus.isCorrectNetwork,
                           'disconnected': !networkStatus.isConnected}"
                [matTooltip]="getNetworkTooltip()">
            </div>
            <span class="network-name">{{networkStatus.network}}</span>
          </div>
          
          <!-- Connect Wallet -->
          <ng-container *ngIf="!wallet; else walletInfo">
            <button mat-raised-button color="primary" (click)="connectWallet()" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner"></span>
              Conectar Billetera
            </button>
          </ng-container>
          
          <!-- Wallet Info -->
          <ng-template #walletInfo>
            <button mat-button [matMenuTriggerFor]="walletMenu" class="wallet-button">
              <mat-icon>account_balance_wallet</mat-icon>
              <span class="address-display">{{formatAddress(wallet?.address)}}</span>
              <span class="balance-display">{{wallet?.balance}} ETH</span>
            </button>
            
            <mat-menu #walletMenu="matMenu">
              <div class="wallet-menu-header">
                <p class="full-address">{{wallet?.address}}</p>
                <p class="wallet-balance">{{wallet?.balance}} ETH</p>
              </div>
              <button mat-menu-item (click)="copyAddress()">
                <mat-icon>content_copy</mat-icon>
                <span>Copiar Dirección</span>
              </button>
              <button mat-menu-item [disabled]="true">
                <mat-icon>exit_to_app</mat-icon>
                <span>Desconectar</span>
              </button>
            </mat-menu>
          </ng-template>
          
          <!-- Theme Toggle -->
          <button mat-icon-button (click)="toggleTheme()" matTooltip="Cambiar Tema">
            <mat-icon>{{isDarkTheme ? 'light_mode' : 'dark_mode'}}</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar-container {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
    }
    
    .dark-toolbar {
      background-color: var(--dark-bg);
      color: var(--text-light);
    }
    
    .app-title {
      display: flex;
      align-items: center;
    }
    
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    
    .logo-link mat-icon {
      margin-right: 8px;
    }
    
    .nav-links {
      display: flex;
    }
    
    .active-link {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .dark-toolbar .active-link {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .network-status {
      display: flex;
      align-items: center;
      margin-right: 1rem;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .connected {
      background-color: var(--success-color);
      box-shadow: 0 0 5px var(--success-color);
    }
    
    .warning {
      background-color: orange;
      box-shadow: 0 0 5px orange;
    }
    
    .disconnected {
      background-color: var(--warn-color);
      box-shadow: 0 0 5px var(--warn-color);
    }
    
    .network-name {
      font-size: 0.85rem;
    }
    
    .wallet-button {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    
    .dark-toolbar .wallet-button {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .address-display {
      margin: 0 8px;
    }
    
    .balance-display {
      font-weight: 500;
    }
    
    .wallet-menu-header {
      padding: 16px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dark-theme .wallet-menu-header {
      background-color: #424242;
      border-bottom: 1px solid #616161;
    }
    
    .full-address {
      font-family: monospace;
      word-break: break-all;
      margin: 0 0 8px 0;
    }
    
    .wallet-balance {
      font-weight: 500;
      font-size: 1.1rem;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .toolbar-container {
        flex-wrap: wrap;
        padding: 0.5rem;
      }
      
      .nav-links {
        order: 3;
        width: 100%;
        justify-content: space-around;
        margin-top: 0.5rem;
      }
      
      .action-buttons {
        gap: 0.5rem;
      }
      
      .network-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  networkStatus: NetworkStatus | null = null;
  wallet: WalletInfo | null = null;
  isLoading = false;
  isDarkTheme = false;
  
  constructor(
    private web3Service: Web3Service,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    this.web3Service.networkStatus$.subscribe(status => {
      this.networkStatus = status;
    });
    
    this.web3Service.wallet$.subscribe(wallet => {
      this.wallet = wallet;
    });
    
    this.web3Service.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
  
  connectWallet(): void {
    this.web3Service.connectWallet();
  }
  
  formatAddress(address: string | undefined): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  copyAddress(): void {
    if (this.wallet) {
      navigator.clipboard.writeText(this.wallet.address);
    }
  }
  
  getNetworkTooltip(): string {
    if (!this.networkStatus) {
      return 'No conectado a ninguna red';
    }
    
    if (!this.networkStatus.isConnected) {
      return 'Sin conexión a la red Ethereum';
    }
    
    if (!this.networkStatus.isCorrectNetwork) {
      return `Conectado a ${this.networkStatus.network}. Por favor, cambie a Ganache Local o Sepolia Testnet`;
    }
    
    return `Conectado a ${this.networkStatus.network}`;
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}