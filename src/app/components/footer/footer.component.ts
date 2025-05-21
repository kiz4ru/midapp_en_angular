import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <footer [ngClass]="{'dark-footer': isDarkTheme}">
      <div class="footer-container">
        <div class="footer-section">
          <p>&copy; {{currentYear}} DApp Angular Ethereum</p>
        </div>
        <div class="footer-section links">
          <a href="https://docs.ethers.org/v6/" target="_blank" rel="noopener noreferrer">Ethers.js</a>
          <a href="https://trufflesuite.com/" target="_blank" rel="noopener noreferrer">Truffle</a>
          <a href="https://angular.dev/" target="_blank" rel="noopener noreferrer">Angular</a>
        </div>
        <div class="footer-section">
          <span class="made-with">
            <mat-icon aria-hidden="false" aria-label="Hecho con amor" fontIcon="favorite"></mat-icon>
          </span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background-color: #f5f5f5;
      padding: 1rem 0;
      border-top: 1px solid #e0e0e0;
      transition: background-color var(--transition-speed), border-color var(--transition-speed);
    }
    
    .dark-footer {
      background-color: var(--dark-bg);
      border-top: 1px solid #424242;
      color: var(--text-light);
    }
    
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
    
    .footer-section {
      display: flex;
      align-items: center;
    }
    
    .links {
      display: flex;
      gap: 1.5rem;
    }
    
    .links a {
      color: var(--primary-color);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .links a:hover {
      text-decoration: underline;
    }
    
    .made-with {
      display: flex;
      align-items: center;
    }
    
    .made-with mat-icon {
      color: var(--accent-color);
      font-size: 18px;
      height: 18px;
      width: 18px;
      margin-left: 4px;
    }
    
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
      }
      
      .footer-section {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isDarkTheme = false;
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }
}