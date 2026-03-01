import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  pendingCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPendingCount();
  }

  loadPendingCount(): void {
const token = localStorage.getItem('auth_token') || '';    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ collaboration: any[]; investment: any[]; tourist: any[] }>(
      'http://localhost:8089/api/admin/services/pending',
      { headers }
    ).subscribe({
      next: (data) => {
        this.pendingCount =
          (data.collaboration?.length || 0) +
          (data.investment?.length || 0) +
          (data.tourist?.length || 0);
      },
      error: (err) => {
        // Fail silently — badge simply won't show
        console.warn('Could not load pending services count', err);
      }
    });
  }
}