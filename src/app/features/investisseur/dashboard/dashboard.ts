import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NotificationBellComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent { }