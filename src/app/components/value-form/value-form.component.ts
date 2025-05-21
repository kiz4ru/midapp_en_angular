import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-value-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="valueForm" (ngSubmit)="onSubmit()" class="value-form">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nuevo Valor</mat-label>
        <input matInput formControlName="value" placeholder="Introduce un nuevo valor" autocomplete="off">
        <mat-error *ngIf="valueForm.get('value')?.hasError('required')">
          El valor es obligatorio
        </mat-error>
        <mat-error *ngIf="valueForm.get('value')?.hasError('minlength')">
          El valor debe tener al menos 1 caracter
        </mat-error>
        <mat-error *ngIf="valueForm.get('value')?.hasError('maxlength')">
          El valor no puede exceder los 100 caracteres
        </mat-error>
      </mat-form-field>
      
      <button 
        mat-raised-button 
        color="primary" 
        type="submit" 
        [disabled]="valueForm.invalid || isLoading"
        class="submit-button">
        <span *ngIf="isLoading" class="button-spinner">
          <mat-spinner diameter="20"></mat-spinner>
        </span>
        <span class="button-text">Actualizar Valor</span>
      </button>
    </form>
  `,
  styles: [`
    .value-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }
    
    .full-width {
      width: 100%;
    }
    
    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
    }
    
    .button-spinner {
      margin-right: 8px;
    }
  `]
})
export class ValueFormComponent {
  @Input() isLoading = false;
  @Output() updateValue = new EventEmitter<string>();
  
  valueForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.valueForm = this.fb.group({
      value: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100)
      ]]
    });
  }
  
  onSubmit(): void {
    if (this.valueForm.valid) {
      const value = this.valueForm.get('value')?.value;
      this.updateValue.emit(value);
      
      // Don't reset the form immediately to avoid visual glitches during loading
      if (!this.isLoading) {
        this.valueForm.reset();
      }
    }
  }
}