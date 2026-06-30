import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdministrationService, UserAdmin } from '../administration.service';
import { UserListComponent } from './user-list.component';

const mockUsers: UserAdmin[] = [
  {
    id: 'user-1',
    email: 'joao@test.com',
    full_name: 'João Silva',
    role: 'admin',
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
];

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let administrationServiceSpy: jasmine.SpyObj<AdministrationService>;

  beforeEach(async () => {
    administrationServiceSpy = jasmine.createSpyObj<AdministrationService>(
      'AdministrationService',
      ['listUsers']
    );
    administrationServiceSpy.listUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: AdministrationService, useValue: administrationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar usuários ao inicializar', () => {
    expect(administrationServiceSpy.listUsers).toHaveBeenCalledTimes(1);
    expect(component.users()).toEqual(mockUsers);
    expect(component.loading()).toBeFalse();
  });

  it('deve exibir mensagem de erro quando listUsers() falha', () => {
    administrationServiceSpy.listUsers.and.returnValue(
      throwError(() => new Error('Erro ao carregar usuários.'))
    );
    component.loadUsers();
    expect(component.errorMessage()).toContain('Erro');
  });

  it('deve retornar label correto para cada role', () => {
    expect(component.roleLabel('admin')).toBe('Administrador');
    expect(component.roleLabel('lawyer')).toBe('Advogado');
    expect(component.roleLabel('assistant')).toBe('Assistente');
    expect(component.roleLabel('viewer')).toBe('Leitura');
  });
});
