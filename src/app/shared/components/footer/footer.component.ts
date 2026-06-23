import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'LEXIA-footer',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .footer {
      background: rgb(0, 0, 35);
      border-top: 1px solid rgba(184,255,60,0.10);
      padding: 1.75rem 4%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer-brand {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .footer-brand span { color: #b8ff3c; }

    .footer-copy {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.38);
      text-align: center;
      flex: 1;
    }

    .footer-links {
      display: flex;
      gap: 1.25rem;
    }

    .footer-links a {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover { color: #b8ff3c; }

    @media (max-width: 600px) {
      .footer { flex-direction: column; text-align: center; }
      .footer-copy { order: 3; }
    }
  `],
  template: `
    <footer class="footer">
      <a class="footer-brand" routerLink="/">LEXIA<span>.</span></a>

      <span class="footer-copy">
        © {{ year }} LEXIA — Todos os direitos reservados.
      </span>

      <nav class="footer-links">
        <a routerLink="/pricing">Planos</a>
        <a routerLink="/login">Entrar</a>
        <a routerLink="/register">Criar conta</a>
      </nav>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
