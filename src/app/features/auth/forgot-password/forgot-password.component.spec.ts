import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['forgotPassword']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário com campo e-mail vazio', () => {
    expect(component.form.controls.email.value).toBe('');
  });

  it('não deve chamar forgotPassword se o formulário for inválido', () => {
    component.submit();
    expect(authServiceSpy.forgotPassword).not.toHaveBeenCalled();
  });

  it('deve chamar forgotPassword com o e-mail informado', () => {
    authServiceSpy.forgotPassword.and.returnValue(of(undefined));
    component.form.controls.email.setValue('usuario@test.com');

    component.submit();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith('usuario@test.com');
    expect(component.success()).toBeTrue();
  });

  it('deve exibir mensagem de erro quando forgotPassword falha', () => {
    authServiceSpy.forgotPassword.and.returnValue(
      throwError(() => new Error('Não foi possível processar a solicitação.'))
    );
    component.form.controls.email.setValue('usuario@test.com');

    component.submit();

    expect(component.success()).toBeFalse();
    expect(component.errorMessage()).toContain('solicitação');
  });
});
