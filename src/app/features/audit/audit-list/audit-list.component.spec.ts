import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuditEvent } from '../audit.service';
import { AuditService } from '../../../core/services/audit.service';
import { AuditListComponent } from './audit-list.component';

const mockEvents: AuditEvent[] = [
  {
    id: 'evt-1',
    event_type: 'LOGIN',
    entity_type: 'user',
    entity_id: 'user-1',
    user_id: 'user-1',
    user_email: null,
    details: {},
    created_at: '2025-01-01T10:00:00Z',
  },
];

describe('AuditListComponent', () => {
  let component: AuditListComponent;
  let fixture: ComponentFixture<AuditListComponent>;
  let auditServiceSpy: jasmine.SpyObj<AuditService>;

  beforeEach(async () => {
    auditServiceSpy = jasmine.createSpyObj<AuditService>('AuditService', ['list']);
    auditServiceSpy.list.and.returnValue(of(mockEvents));

    await TestBed.configureTestingModule({
      imports: [AuditListComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar eventos ao inicializar', () => {
    expect(auditServiceSpy.list).toHaveBeenCalledTimes(1);
    expect(component.events()).toEqual(mockEvents);
    expect(component.loading()).toBeFalse();
  });

  it('deve exibir mensagem de erro quando list() falha', () => {
    auditServiceSpy.list.and.returnValue(
      throwError(() => new Error('Erro ao carregar auditoria.'))
    );
    component.loadEvents();
    expect(component.errorMessage()).toContain('Erro');
  });
});
