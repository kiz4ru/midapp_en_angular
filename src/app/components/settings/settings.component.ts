import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Web3Service, WalletInfo } from '../../services/web3.service';
import { ThemeService } from '../../services/theme.service';
import { WalletPromptComponent } from '../wallet-prompt/wallet-prompt.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    WalletPromptComponent,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-container" [ngClass]="{'dark-theme': isDarkTheme}">
      <h1 class="page-title">Configuración</h1>
      
      <!-- Wallet Prompt -->
      <app-wallet-prompt *ngIf="!wallet"></app-wallet-prompt>
      
      <!-- Settings Content -->
      <div *ngIf="wallet" class="settings-content">
        <div class="settings-grid">
          <!-- Theme Settings -->
          <mat-card class="settings-card theme-card fade-in">
            <mat-card-header>
              <mat-card-title>Apariencia</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="theme-toggle">
                <mat-icon>light_mode</mat-icon>
                <mat-slide-toggle 
                  [checked]="isDarkTheme" 
                  (change)="toggleTheme()"
                  color="primary">
                </mat-slide-toggle>
                <mat-icon>dark_mode</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
          
          <!-- Contract Information -->
          <mat-card class="settings-card contract-card fade-in">
            <mat-card-header>
              <mat-card-title>Información del Contrato</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="contract-info">
                <div class="info-item">
                  <span class="label">Propietario del Contrato:</span>
                  <span class="value" *ngIf="contractOwner">
                    {{ formatAddress(contractOwner) }}
                    <button 
                      mat-icon-button 
                      matTooltip="Copiar Dirección" 
                      (click)="copyAddress(contractOwner)">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </span>
                  <span class="value" *ngIf="!contractOwner">Cargando...</span>
                </div>
                <div class="info-item">
                  <span class="label">Tu Autorización:</span>
                  <span class="value authorization-status" [ngClass]="{'authorized': wallet.isAuthorized}">
                    {{ wallet.isAuthorized ? 'Autorizado' : 'No Autorizado' }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <!-- Authorization Management (Owner Only) -->
          <mat-card *ngIf="isContractOwner" class="settings-card auth-card fade-in">
            <mat-card-header>
              <mat-card-title>Gestión de Autorizaciones</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="authForm" (ngSubmit)="authorizeAddress()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Dirección Ethereum</mat-label>
                  <input matInput formControlName="addressToAuthorize" placeholder="0x...">
                  <mat-error *ngIf="authForm.get('addressToAuthorize')?.hasError('required')">
                    La dirección es requerida.
                  </mat-error>
                  <mat-error *ngIf="authForm.get('addressToAuthorize')?.hasError('pattern')">
                    Formato de dirección inválido.
                  </mat-error>
                </mat-form-field>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="authForm.invalid || authInProgress"
                  class="auth-button">
                  <mat-icon *ngIf="!authInProgress">person_add</mat-icon>
                  <span *ngIf="!authInProgress">Autorizar Dirección</span>
                  <mat-progress-spinner *ngIf="authInProgress" mode="indeterminate" diameter="20"></mat-progress-spinner>
                </button>
              </form>
              
              <mat-divider class="divider"></mat-divider>
              
              <h3 class="sub-heading">Direcciones Autorizadas</h3>
              <div *ngIf="authorizedAddresses.length === 0" class="empty-state">
                No hay direcciones autorizadas.
              </div>
              <mat-list *ngIf="authorizedAddresses.length > 0" class="authorized-list">
                <mat-list-item *ngFor="let addr of authorizedAddresses" class="list-item">
                  <mat-icon matListItemIcon>verified_user</mat-icon>
                  <div matListItemTitle class="address-text">{{ formatAddress(addr) }}</div>
                  <div matListItemMeta class="actions">
                    <button 
                      mat-icon-button 
                      matTooltip="Copiar Dirección" 
                      (click)="copyAddress(addr)">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="warn" 
                      matTooltip="Revocar Autorización" 
                      (click)="revokeAddress(addr)"
                      [disabled]="revokeInProgress[addr]">
                      <mat-icon *ngIf="!revokeInProgress[addr]">person_remove</mat-icon>
                      <mat-progress-spinner *ngIf="revokeInProgress[addr]" mode="indeterminate" diameter="20"></mat-progress-spinner>
                    </button>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 1.5rem 0;
    }
    
    .page-title {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      text-align: center;
      color: var(--primary-color);
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .settings-card {
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .settings-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .dark-theme .settings-card {
      background-color: var(--card-bg-dark);
      color: var(--text-light);
    }
    
    .dark-theme .settings-card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    
    .theme-card {
      min-height: 150px;
    }
    
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .contract-card {
      min-height: 150px;
    }
    
    .contract-info {
      margin-top: 1rem;
    }
    
    .info-item {
      display: flex;
      margin-bottom: 1rem;
      align-items: center;
    }
    
    .label {
      font-weight: 500;
      margin-right: 0.5rem;
      min-width: 140px;
    }
    
    .value {
      display: flex;
      align-items: center;
    }
    
    .authorization-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .authorization-status.authorized {
      background-color: rgba(76, 175, 80, 0.2);
      color: #2e7d32;
    }
    
    .dark-theme .authorization-status.authorized {
      background-color: rgba(76, 175, 80, 0.3);
      color: #81c784;
    }
    
    .auth-card {
      grid-column: 1 / -1;
    }
    
    .auth-form {
      margin-bottom: 1.5rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
    }
    
    .divider {
      margin: 1.5rem 0;
    }
    
    .authorized-addresses h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .loading-addresses, .no-addresses {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: #9e9e9e;
    }
    
    .loading-addresses {
      gap: 0.5rem;
    }
    
    .address-item {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dark-theme .address-item {
      border-bottom: 1px solid #616161;
    }
    
    .address-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    .address-value {
      word-break: break-all;
      font-family: monospace;
    }
    
    .full-width {
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem 0;
      }
      
      .page-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .settings-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .label {
        margin-bottom: 0.25rem;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  wallet: WalletInfo | null = null;
  isDarkTheme = false;
  loadingAddresses = true;
  authInProgress = false;
  revokeInProgress: { [address: string]: boolean } = {};
  
  contractOwner = '';
  isContractOwner = false;
  authorizedAddresses: string[] = [];
  
  authForm: FormGroup;
  
  constructor(
    private web3Service: Web3Service,
    private themeService: ThemeService,
    private fb: FormBuilder
  ) {
    this.authForm = this.fb.group({
      addressToAuthorize: ['', [
        Validators.required,
        Validators.pattern(/^0x[a-fA-F0-9]{40}$/)
      ]]
    });
  }
  
  ngOnInit(): void {
    this.web3Service.wallet$.subscribe(wallet => {
      this.wallet = wallet;
      if (wallet) {
        this.loadContractInfo();
      }
    });
    
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
  
  async loadContractInfo(): Promise<void> {
    try {
      // Get contract owner
      this.contractOwner = await this.web3Service.getContractOwner();
      
      // Check if current user is the owner
      if (this.wallet && this.contractOwner) {
        this.isContractOwner = this.wallet.address.toLowerCase() === this.contractOwner.toLowerCase();
      }
      
      // If owner, load authorized addresses
      if (this.isContractOwner) {
        this.loadAuthorizedAddresses();
      }
    } catch (error) {
      console.error('Error loading contract info:', error);
    }
  }
  
  async loadAuthorizedAddresses(): Promise<void> {
    this.loadingAddresses = true;
    try {
      this.authorizedAddresses = await this.web3Service.getAuthorizedAddresses();
    } catch (error) {
      console.error('Error loading authorized addresses:', error);
    } finally {
      this.loadingAddresses = false;
    }
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  copyAddress(address: string): void {
    navigator.clipboard.writeText(address);
  }
  
  async authorizeAddress(): Promise<void> {
    if (this.authForm.invalid) {
      return;
    }
    this.authInProgress = true;
    const address = this.authForm.get('addressToAuthorize')?.value;
    try {
      const success = await this.web3Service.authorizeAddress(address);
      if (success) {
        this.authForm.reset();
        this.loadAuthorizedAddresses();
      }
    } catch (error) {
      console.error('Error authorizing address in component:', error);
    } finally {
      this.authInProgress = false;
    }
  }
  
  async revokeAddress(address: string): Promise<void> {
    this.revokeInProgress[address] = true;
    try {
      const success = await this.web3Service.revokeAuthorization(address);
      if (success) {
        this.loadAuthorizedAddresses();
      }
    } catch (error) {
      console.error(`Error revoking address ${address} in component:`, error);
    } finally {
      this.revokeInProgress[address] = false;
    }
  }
}