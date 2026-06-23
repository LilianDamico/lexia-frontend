import { Component, inject, OnInit, signal } from '@angular/core';
import { AppNotification, NotificationsService } from '../notifications.service';
import { LexIADatePipe } from '../../../shared/pipes/lexia-date.pipe';

@Component({
  selector: 'lexia-notification-list',
  standalone: true,
  imports: [LexIADatePipe],
  template: `
    <div class="ai-disclaimer">
      <span>⚠️</span>
      <span>⚠️ Esta informação foi gerada por IA e requer revisão humana.</span>
    </div>

    <section class="page">
      <header class="page-header">
        <div>
          <h2>Notificações</h2>
          <p>Acompanhe alertas operacionais, urgências e comunicações internas do escritório.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="loadNotifications()" [disabled]="loading()">Atualizar</button>
          <button type="button" class="btn-primary" (click)="markAllAsRead()" [disabled]="markingAll() || !hasUnread()">
            {{ markingAll() ? 'Marcando...' : 'Marcar todas como lidas' }}
          </button>
        </div>
      </header>

      @if (errorMessage()) {
        <p class="alert alert-error">{{ errorMessage() }}</p>
      }
      @if (successMessage()) {
        <p class="alert alert-success">{{ successMessage() }}</p>
      }

      <article class="card">
        @if (loading()) {
          <p>Carregando notificações...</p>
        } @else if (!notifications().length) {
          <div class="empty-state">
            <h3>Nenhuma notificação disponível</h3>
            <p>Os novos alertas do sistema aparecerão aqui automaticamente.</p>
          </div>
        } @else {
          <div class="notifications-list">
            @for (notification of notifications(); track notification.id) {
              <article class="notification-item" [class.unread]="isUnread(notification)">
                <div class="notification-header">
                  <div class="notification-title-block">
                    <span class="notification-icon">{{ urgencyIcon(notification.notification_type) }}</span>
                    <div>
                      <h3>{{ notification.title }}</h3>
                      <p class="muted">{{ notification.created_at | lexiaDate }}</p>
                    </div>
                  </div>
                  @if (isUnread(notification)) {
                    <span class="status-badge unread">Não lida</span>
                  } @else {
                    <span class="status-badge read">Lida</span>
                  }
                </div>

                <p>{{ notification.body }}</p>

                <div class="notification-meta">
                  <span><strong>Tipo:</strong> {{ notification.notification_type }}</span>
                  <span><strong>Referência:</strong> {{ notification.reference_type || '—' }}</span>
                  <span><strong>ID ref.:</strong> {{ notification.reference_id || '—' }}</span>
                </div>
              </article>
            }
          </div>
        }
      </article>
    </section>
  `,
  styles: [`
    .notifications-list {
      display: grid;
      gap: 1rem;
    }
    .notification-item {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
    }
    .notification-item.unread {
      border-color: #bfdbfe;
      background: #f8fbff;
    }
    .notification-header,
    .notification-title-block,
    .notification-meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .notification-title-block {
      justify-content: flex-start;
    }
    .notification-title-block h3 {
      margin: 0 0 0.2rem;
    }
    .notification-icon {
      font-size: 1.5rem;
      line-height: 1;
    }
    .notification-meta {
      color: #475569;
      font-size: 0.9rem;
      justify-content: flex-start;
    }
  `],
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
