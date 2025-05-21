import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-wallet-prompt',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="wallet-prompt-container">
      <mat-card class="wallet-prompt-card fade-in">
        <mat-card-content>
          <div class="prompt-content">
            <div class="wallet-icon">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <h2 class="prompt-title">Conecta Tu Billetera</h2>
            <p class="prompt-text">
              Para interactuar con la blockchain y almacenar valores, necesitas conectar tu billetera de Ethereum.
            </p>
            <div class="wallet-features">
              <div class="feature">
                <mat-icon>security</mat-icon>
                <span>Conexión Segura</span>
              </div>
              <div class="feature">
                <mat-icon>history</mat-icon>
                <span>Ver Historial de Transacciones</span>
              </div>
              <div class="feature">
                <mat-icon>edit</mat-icon>
                <span>Almacenar Valores en Blockchain</span>
              </div>
            </div>
            <button mat-raised-button color="primary" (click)="connectWallet()" class="connect-button">
              <span *ngIf="isLoading" class="spinner"></span>
              Conectar con MetaMask
            </button>
            <p class="metamask-note">
              ¿No tienes MetaMask? 
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                Instálalo ahora
              </a>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .wallet-prompt-container {
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
    }
    
    .wallet-prompt-card {
      max-width: 500px;
      width: 100%;
    }
    
    .prompt-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.5rem;
    }
    
    .wallet-icon {
      background-color: var(--primary-color);
      color: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .wallet-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    
    .prompt-title {
      font-size: 1.75rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }
    
    .prompt-text {
      margin-bottom: 1.5rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #666;
    }
    
    :host-context(.dark-theme) .prompt-text {
      color: #bbb;
    }
    
    .wallet-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      width: 100%;
    }
    
    .feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .feature mat-icon {
      color: var(--primary-color);
    }
    
    .connect-button {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    .metamask-note {
      font-size: 0.875rem;
      color: #666;
    }
    
    :host-context(.dark-theme) .metamask-note {
      color: #bbb;
    }
    
    .metamask-note a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    .metamask-note a:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .wallet-prompt-container {
        padding: 1rem 0.5rem;
      }
      
      .prompt-content {
        padding: 1rem;
      }
      
      .wallet-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 1rem;
      }
      
      .wallet-icon mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }
      
      .prompt-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class WalletPromptComponent {
  isLoading = false;
  
  constructor(private web3Service: Web3Service) {
    this.web3Service.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }
  
  connectWallet(): void {
    this.web3Service.connectWallet();
  }
}