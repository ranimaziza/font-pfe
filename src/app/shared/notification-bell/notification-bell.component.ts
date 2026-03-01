import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth';
import { Role } from '../models/user.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bell-wrapper" *ngIf="shouldShow">
      <button class="bell-btn" (click)="togglePanel()" [class.active]="panelOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="badge" *ngIf="unreadCount > 0">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <div class="notif-panel" *ngIf="panelOpen">
        <div class="panel-header">
          <span>Notifications</span>
          <button class="mark-all-btn" (click)="markAllRead()" *ngIf="unreadCount > 0">
            Mark all read
          </button>
        </div>
        <div class="panel-body">
          <div class="notif-empty" *ngIf="notifications.length === 0">
            No notifications
          </div>
          <div class="notif-item"
               *ngFor="let n of notifications"
               [class.unread]="!n.read"
               (click)="markRead(n)">
            <div class="notif-icon">{{ getIcon(n.serviceType) }}</div>
            <div class="notif-content">
              <p class="notif-title">{{ n.title }}</p>
              <p class="notif-msg">{{ n.message }}</p>
              <span class="notif-time">{{ formatTime(n.createdAt) }}</span>
            </div>
            <div class="unread-dot" *ngIf="!n.read"></div>
          </div>
        </div>
      </div>

      <div class="overlay" *ngIf="panelOpen" (click)="panelOpen = false"></div>
    </div>
  `,
  styles: [`
    .bell-wrapper { position: relative; display: inline-block; }

    .bell-btn {
      position: relative;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 50%;
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #475569;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .bell-btn:hover, .bell-btn.active {
      color: #2563eb; border-color: #2563eb;
      box-shadow: 0 4px 14px rgba(37,99,235,0.2);
    }

    .badge {
      position: absolute; top: -4px; right: -4px;
      background: #dc2626; color: white;
      font-size: 0.6rem; font-weight: 700;
      min-width: 16px; height: 16px;
      border-radius: 50px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; border: 2px solid white;
    }

    .notif-panel {
      position: absolute; top: calc(100% + 10px); right: 0;
      width: 340px; background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0; z-index: 1000; overflow: hidden;
    }

    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem; font-weight: 600; color: #0f172a;
      border-bottom: 1px solid #f1f5f9; background: #f8fafc;
    }

    .mark-all-btn {
      background: none; border: none;
      font-size: 0.8rem; color: #2563eb;
      cursor: pointer; font-weight: 500;
    }
    .mark-all-btn:hover { text-decoration: underline; }

    .panel-body { max-height: 380px; overflow-y: auto; }

    .notif-empty {
      padding: 2.5rem; text-align: center;
      color: #94a3b8; font-size: 0.9rem;
    }

    .notif-item {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer; transition: background 0.15s; position: relative;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #eff6ff; }

    .notif-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 2px; }

    .notif-content { flex: 1; }
    .notif-title { margin: 0 0 0.2rem; font-size: 0.85rem; font-weight: 600; color: #0f172a; }
    .notif-msg { margin: 0 0 0.25rem; font-size: 0.82rem; color: #475569; line-height: 1.4; }
    .notif-time { font-size: 0.75rem; color: #94a3b8; }

    .unread-dot {
      width: 8px; height: 8px; background: #2563eb;
      border-radius: 50%; flex-shrink: 0; margin-top: 6px;
    }

    .overlay { position: fixed; inset: 0; z-index: 999; }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  notifications: AppNotification[] = [];
  panelOpen = false;
  shouldShow = false;
  private pollSub?: Subscription;

  private notifService = inject(NotificationService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.shouldShow = role === Role.TOURIST ||
                      role === Role.INVESTOR ||
                      role === Role.PARTNER ||
                      role === Role.LOCAL_PARTNER;

    if (this.shouldShow) {
      this.loadNotifications();
      this.pollSub = interval(30000).pipe(
        switchMap(() => this.notifService.getMyNotifications())
      ).subscribe((notifs: AppNotification[]) => this.notifications = notifs);
    }
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  togglePanel(): void { this.panelOpen = !this.panelOpen; }

  loadNotifications(): void {
    this.notifService.getMyNotifications().subscribe({
      next: (notifs: AppNotification[]) => this.notifications = notifs,
      error: () => {}
    });
  }

  markRead(n: AppNotification): void {
    if (!n.read) {
      this.notifService.markAsRead(n.id).subscribe();
      n.read = true;
    }
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe();
    this.notifications.forEach(n => n.read = true);
  }

  getIcon(type?: string): string {
    switch (type) {
      case 'TOURIST': return '🌍';
      case 'INVESTMENT': return '📈';
      case 'COLLABORATION': return '🤝';
      default: return '🔔';
    }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
}