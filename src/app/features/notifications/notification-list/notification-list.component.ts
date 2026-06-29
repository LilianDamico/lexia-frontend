import { Component, inject, OnInit, signal } from '@angular/core';
import { AppNotification, NotificationsService } from '../notifications.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-notification-list',
  standalone: true,
  imports: [LexIADatePipe],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.css'
})
export class NotificationListComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);

  readonly notifications = signal<AppNotification[]>([]);
  readonly loading = signal(true);
  readonly markingAll = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.notificationsService.list().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications()
      .filter((notification) => this.isUnread(notification))
      .map((notification) => notification.id);

    if (!unreadIds.length) {
      this.successMessage.set('Todas as notificações já estão marcadas como lidas.');
      return;
    }

    this.markingAll.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.notificationsService.markRead(unreadIds).subscribe({
      next: () => {
        const markedAt = new Date().toISOString();
        this.notifications.update((items) => items.map((item) => (
          unreadIds.includes(item.id) ? { ...item, read_at: markedAt } : item
        )));
        this.markingAll.set(false);
        this.successMessage.set('Notificações marcadas como lidas com sucesso.');
      },
      error: (error: Error) => {
        this.markingAll.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  hasUnread(): boolean {
    return this.notifications().some((notification) => this.isUnread(notification));
  }

  isUnread(notification: AppNotification): boolean {
    return notification.read_at === null;
  }

  urgencyIcon(notificationType: string): string {
    if (notificationType.includes('expired')) return '🚨';
    if (notificationType.includes('expiring')) return '⚠️';
    return '🔔';
  }
}
