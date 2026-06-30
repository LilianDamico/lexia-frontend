import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/auth.model';
import { SettingsComponent } from './settings.component';

const mockUser: AuthUser = {
  userId: 'user-1',
  email: 'joao@test.com',
  role: 'admin',
  lawOfficeId: 'office-1',
};

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['changePassword'],
      { user: signal(mockUser) }
    );

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o e-mail do usuário atual', () => {
    expect(component.currentUser()?.email).toBe('joao@test.com');
  });

  it('não deve chamar changePassword se o formulário for inválido', () => {
    component.changePassword();
    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
  });

  it('deve chamar changePassword com senha atual e nova senha', () => {
    authServiceSpy.changePassword.and.returnValue(of(undefined));
    component.passwordForm.setValue({
      currentPassword: 'senhaAtual123',
      newPassword: 'novaSenha456',
      confirmPassword: 'novaSenha456',
    });

    component.changePassword();

    expect(authServiceSpy.changePassword).toHaveBeenCalledWith('senhaAtual123', 'novaSenha456');
    expect(component.passwordSuccess()).toBe('Senha alterada com sucesso!');
  });

  it('deve exibir erro quando as senhas não conferem', () => {
    component.passwordForm.setValue({
      currentPassword: 'senhaAtual123',
      newPassword: 'novaSenha456',
      confirmPassword: 'diferente789',
    });

    component.changePassword();

    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(component.passwordError()).toContain('conferem');
  });

  it('deve exibir erro quando changePassword falha', () => {
    authServiceSpy.changePassword.and.returnValue(
      throwError(() => new Error('Senha atual incorreta.'))
    );
    component.passwordForm.setValue({
      currentPassword: 'senhaErrada',
      newPassword: 'novaSenha456',
      confirmPassword: 'novaSenha456',
    });

    component.changePassword();

    expect(component.passwordError()).toContain('incorreta');
  });
});
