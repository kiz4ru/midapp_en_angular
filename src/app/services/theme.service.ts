import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  
  isDarkTheme$ = this.darkThemeSubject.asObservable();
  
  constructor() {
    this.initTheme();
  }
  
  private initTheme(): void {
    // Check local storage first
    const storedPreference = localStorage.getItem(this.THEME_KEY);
    if (storedPreference) {
      this.darkThemeSubject.next(storedPreference === 'dark');
      return;
    }
    
    // If no stored preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkThemeSubject.next(prefersDark);
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.darkThemeSubject.next(e.matches);
      }
    });
  }
  
  toggleTheme(): void {
    const newValue = !this.darkThemeSubject.value;
    this.darkThemeSubject.next(newValue);
    localStorage.setItem(this.THEME_KEY, newValue ? 'dark' : 'light');
  }
  
  setDarkTheme(isDark: boolean): void {
    this.darkThemeSubject.next(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }
}