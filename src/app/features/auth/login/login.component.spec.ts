import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TokenResponse } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

const mockToken: TokenResponse = {
  access_token: 'token-abc',
  refresh_token: 'refresh-abc',
  token_type: 'bearer',
  user_id: 'user-1',
  email: 'user@test.com',
  role: 'admin',
  law_office_id: 'office-1',
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('inicialização', () => {
    it('deve inicializar o formulário com campos vazios', () => {
      expect(component.form.controls.email.value).toBe('');
      expect(component.form.controls.password.value).toBe('');
    });

    it('deve redirecionar para /dashboard se já estiver autenticado', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('não deve redirecionar se não estiver autenticado', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

      component.ngOnInit();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('validação do formulário', () => {
    it('deve ser inválido com campos vazios', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('deve ser inválido com e-mail em formato incorreto', () => {
      component.form.controls.email.setValue('email-invalido');
      component.form.controls.password.setValue('senha123');
      expect(component.form.invalid).toBeTrue();
    });

    it('deve ser válido com e-mail e senha preenchidos corretamente', () => {
      component.form.controls.email.setValue('user@test.com');
      component.form.controls.password.setValue('senha123');
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('submit()', () => {
    it('não deve chamar AuthService.login se o formulário for inválido', () => {
      component.submit();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('deve marcar submitted como true ao enviar', () => {
      component.submit();
      expect(component.submitted()).toBeTrue();
    });

    it('deve ativar loading enquanto a requisição está em andamento', () => {
      const loginSubject = new Subject<TokenResponse>();
      authServiceSpy.login.and.returnValue(loginSubject.asObservable());
      component.form.controls.email.setValue('user@test.com');
      component.form.controls.password.setValue('senha123');

      component.submit();

      expect(component.loading()).toBeTrue();
      loginSubject.complete();
    });

    it('deve navegar para /dashboard após login bem-sucedido', () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      authServiceSpy.login.and.returnValue(of(mockToken));
      component.form.controls.email.setValue('user@test.com');
      component.form.controls.password.setValue('senha123');

      component.submit();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(component.loading()).toBeFalse();
    });

    it('deve exibir mensagem de erro e desativar loading quando a autenticação falha', () => {
      const errorMsg = 'Não foi possível autenticar com as credenciais informadas.';
      authServiceSpy.login.and.returnValue(throwError(() => new Error(errorMsg)));
      component.form.controls.email.setValue('user@test.com');
      component.form.controls.password.setValue('senha123');

      component.submit();

      expect(component.errorMessage()).toBe(errorMsg);
      expect(component.loading()).toBeFalse();
    });

    it('deve limpar a mensagem de erro a cada novo submit', () => {
      component.errorMessage.set('Erro anterior');
      authServiceSpy.login.and.returnValue(of(mockToken));
      spyOn(router, 'navigate').and.resolveTo(true);
      component.form.controls.email.setValue('user@test.com');
      component.form.controls.password.setValue('senha123');

      component.submit();

      expect(component.errorMessage()).toBe('');
    });
  });
});
