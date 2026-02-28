import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnDestroy {
  email = '';
  loading = false;
  errorMsg = '';
  successMsg = '';
  emailSent = false;
  
  // Resend timer
  resendDisabled = false;
  resendTimer = 30;
  private timerInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmitEmail() {
    if (!this.email) {
      this.errorMsg = 'Email is required';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMsg = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    // Appel au service d'authentification
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.emailSent = true;
        this.successMsg = 'Reset instructions sent to your email';
        console.log('✅ Reset email sent:', response);
        
        // Démarrer le timer pour le bouton "Resend"
        this.startResendTimer();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.message || 'An error occurred. Please try again.';
        console.error('❌ Forgot password error:', err);
      }
    });
  }

  resendEmail() {
    if (this.resendDisabled) return;
    
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMsg = 'Reset instructions resent to your email';
        console.log('✅ Reset email resent:', response);
        
        // Redémarrer le timer
        this.startResendTimer();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.message || 'An error occurred. Please try again.';
        console.error('❌ Resend email error:', err);
      }
    });
  }

  private startResendTimer() {
    this.resendDisabled = true;
    this.resendTimer = 30;
    
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      
      if (this.resendTimer <= 0) {
        this.resendDisabled = false;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}