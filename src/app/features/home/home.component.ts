import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'LEXIA-home',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    :host {
      --navy:      rgb(0, 0, 50);
      --navy-mid:  rgb(0, 0, 80);
      --navy-soft: rgb(10, 10, 70);
      --lime:      #b8ff3c;
      --lime-dim:  #94cc2e;
      --white:     #ffffff;
      --off-white: #f7f8fc;
      --muted:     rgba(255,255,255,0.60);
      display: block;
      font-family: 'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
    }

    /* Hero */
    .hero {
      min-height: calc(100vh - 62px);
      background: var(--navy);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 5rem 4%;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -180px; left: 50%;
      transform: translateX(-50%);
      width: 900px; height: 900px;
      background: radial-gradient(circle, rgba(184,255,60,0.08) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      border: 1px solid rgba(184,255,60,0.35);
      color: var(--lime);
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 1.75rem;
      letter-spacing: 0.04em;
    }
    .hero-badge-dot {
      width: 6px; height: 6px;
      background: var(--lime);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
    .hero-title {
      font-size: clamp(2.4rem, 6vw, 4.6rem);
      font-weight: 800;
      color: var(--white);
      line-height: 1.08;
      letter-spacing: -0.04em;
      margin: 0 0 1.5rem;
      max-width: 820px;
    }
    .hero-title em {
      font-style: normal;
      color: var(--lime);
    }
    .hero-sub {
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: var(--muted);
      max-width: 620px;
      line-height: 1.7;
      margin: 0 0 2.5rem;
    }
    .hero-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .btn-hero-primary {
      background: var(--lime);
      color: var(--navy);
      font-weight: 700;
      font-size: 1rem;
      padding: 0.85rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-hero-primary:hover { background: var(--lime-dim); transform: translateY(-2px); }
    .btn-hero-ghost {
      border: 1.5px solid rgba(255,255,255,0.3);
      color: var(--white);
      font-weight: 600;
      font-size: 1rem;
      padding: 0.85rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-hero-ghost:hover { border-color: var(--lime); background: rgba(184,255,60,0.05); }

    /* Stats bar */
    .stats-bar {
      background: rgba(255,255,255,0.04);
      border-top: 1px solid rgba(184,255,60,0.15);
      border-bottom: 1px solid rgba(184,255,60,0.15);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0;
    }
    .stat-item {
      flex: 1 1 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.75rem 1rem;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .stat-item:last-child { border-right: none; }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--lime);
      line-height: 1;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--muted);
      margin-top: 0.35rem;
      text-align: center;
    }

    /* Sections */
    .section {
      padding: 5rem 4%;
    }
    .section-dark  { background: var(--navy-soft); }
    .section-light { background: var(--off-white); }
    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .section-label {
      display: inline-block;
      background: rgba(184,255,60,0.12);
      color: var(--lime);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      margin-bottom: 1rem;
    }
    .section-label-dark { background: rgba(0,0,50,0.08); color: var(--navy); }
    .section-title {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      color: var(--white);
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin: 0 0 1rem;
    }
    .section-title-dark { color: var(--navy); }
    .section-desc {
      font-size: 1.05rem;
      color: var(--muted);
      max-width: 560px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .section-desc-dark { color: rgba(0,0,50,0.65); }

    /* Features grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .feature-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(184,255,60,0.12);
      border-radius: 16px;
      padding: 2rem 1.75rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .feature-card:hover { border-color: rgba(184,255,60,0.4); transform: translateY(-4px); }
    .feature-icon {
      width: 48px; height: 48px;
      background: rgba(184,255,60,0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--lime);
      font-weight: 800;
    }
    .feature-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--white);
      margin: 0 0 0.6rem;
    }
    .feature-desc {
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.65;
      margin: 0 0 1rem;
    }
    .feature-tag {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--lime);
      background: rgba(184,255,60,0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    /* Steps */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 2rem;
      counter-reset: step;
    }
    .step-card {
      text-align: center;
      padding: 1.5rem;
    }
    .step-number {
      width: 56px; height: 56px;
      background: var(--navy);
      border: 2px solid var(--lime);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--lime);
      margin: 0 auto 1.25rem;
    }
    .step-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--navy);
      margin: 0 0 0.5rem;
    }
    .step-desc {
      font-size: 0.9rem;
      color: rgba(0,0,50,0.65);
      line-height: 1.65;
      margin: 0;
    }

    /* CTA final */
    .cta-section {
      background: var(--navy);
      text-align: center;
      padding: 6rem 4%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Responsivo */
    @media (max-width: 640px) {
      .hero { padding: 4rem 5%; }
      .stats-bar { flex-direction: column; }
      .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
    }
  `],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        Plataforma jur&iacute;dica com IA
      </div>
      <h1 class="hero-title">
        O escrit&oacute;rio do futuro<br>
        come&ccedil;a com a <em>LEXIA</em>
      </h1>
      <p class="hero-sub">
        Gerencie casos, documentos, prazos e pesquisas jur&iacute;dicas com
        intelig&ecirc;ncia artificial integrada, do cadastro at&eacute; o julgamento.
      </p>
      <div class="hero-cta">
        <a class="btn-hero-primary" routerLink="/register">Criar conta &#x203A;</a>
        <a class="btn-hero-ghost" routerLink="/login">Acessar minha conta</a>
      </div>
    </section>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">100%</span>
        <span class="stat-label">Multi-tenant isolado</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">IA</span>
        <span class="stat-label">Resumos e pesquisa autom&aacute;tica</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">360&deg;</span>
        <span class="stat-label">Casos, clientes e documentos</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">JWT</span>
        <span class="stat-label">Seguran&ccedil;a enterprise</span>
      </div>
    </div>

    <!-- Features -->
    <section class="section section-dark">
      <div style="max-width:1200px;margin:0 auto">
        <div class="section-header">
          <span class="section-label">Funcionalidades</span>
          <h2 class="section-title">Tudo que um escrit&oacute;rio<br>moderno precisa</h2>
          <p class="section-desc">
            Uma plataforma completa, do gerenciamento operacional &agrave; intelig&ecirc;ncia jur&iacute;dica com IA.
          </p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">&#9878;</div>
            <h3 class="feature-title">Gest&atilde;o de Casos</h3>
            <p class="feature-desc">Organize processos, acompanhe etapas e vincule clientes, documentos, prazos e audi&ecirc;ncias em um &uacute;nico lugar.</p>
            <span class="feature-tag">Core</span>
          </div>
          <div class="feature-card">
            <div class="feature-icon">IA</div>
            <h3 class="feature-title">IA Jur&iacute;dica</h3>
            <p class="feature-desc">Resumos autom&aacute;ticos de documentos e casos, pesquisa jur&iacute;dica interna e respostas fundamentadas com rastreabilidade.</p>
            <span class="feature-tag">IA &middot; OpenAI</span>
          </div>
          <div class="feature-card">
            <div class="feature-icon">&#128196;</div>
            <h3 class="feature-title">Gest&atilde;o Documental</h3>
            <p class="feature-desc">Upload seguro de PDF, DOCX e TXT com extra&ccedil;&atilde;o de texto autom&aacute;tica e resumo por IA &mdash; at&eacute; 20 MB por arquivo.</p>
            <span class="feature-tag">OCR &middot; Extra&ccedil;&atilde;o</span>
          </div>
          <div class="feature-card">
            <div class="feature-icon">&#9201;</div>
            <h3 class="feature-title">Prazos e Audi&ecirc;ncias</h3>
            <p class="feature-desc">Controle de prazos processuais e agenda de audi&ecirc;ncias vinculados a casos, com notifica&ccedil;&otilde;es proativas.</p>
            <span class="feature-tag">Agenda</span>
          </div>
          <div class="feature-card">
            <div class="feature-icon">&#128269;</div>
            <h3 class="feature-title">Pesquisa Jur&iacute;dica</h3>
            <p class="feature-desc">Pesquisa interna sobre seus documentos e integra&ccedil;&atilde;o com fontes externas como o CNJ DataJud.</p>
            <span class="feature-tag">DataJud &middot; RAG</span>
          </div>
          <div class="feature-card">
            <div class="feature-icon">&#128274;</div>
            <h3 class="feature-title">Multi-escrit&oacute;rio</h3>
            <p class="feature-desc">Cada escrit&oacute;rio &eacute; um tenant completamente isolado. Dados, usu&aacute;rios e permiss&otilde;es nunca se cruzam.</p>
            <span class="feature-tag">Multi-tenant</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Como funciona -->
    <section class="section section-light">
      <div style="max-width:1000px;margin:0 auto">
        <div class="section-header" style="text-align:center">
          <span class="section-label section-label-dark">Como funciona</span>
          <h2 class="section-title section-title-dark">Pronto para usar em minutos</h2>
          <p class="section-desc section-desc-dark" style="margin:0 auto">
            Sem burocracia, sem necessidade de suporte. Voc&ecirc; cria o escrit&oacute;rio e j&aacute; come&ccedil;a a operar.
          </p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3 class="step-title">Crie sua conta</h3>
            <p class="step-desc">Informe seu nome, e-mail, senha e o nome do escrit&oacute;rio. O tenant &eacute; criado instantaneamente.</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3 class="step-title">Configure o escrit&oacute;rio</h3>
            <p class="step-desc">Adicione usu&aacute;rios, &aacute;reas jur&iacute;dicas e personalize as configura&ccedil;&otilde;es do seu espa&ccedil;o de trabalho.</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3 class="step-title">Opere com IA</h3>
            <p class="step-desc">Cadastre clientes, abra casos, fa&ccedil;a upload de documentos e use a IA para resumir e pesquisar.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="cta-section">
      <span class="section-label">Comece agora</span>
      <h2 class="section-title" style="margin:0.5rem auto 0.75rem">Eleve o n&iacute;vel do seu escrit&oacute;rio</h2>
      <p class="section-desc">
        Junte-se a escrit&oacute;rios que j&aacute; trabalham com intelig&ecirc;ncia jur&iacute;dica real.
        Assine um plano e comece a operar agora.
      </p>
      <div class="hero-cta" style="margin-top:2rem">
        <a class="btn-hero-primary" routerLink="/register">Criar conta &#x203A;</a>
        <a class="btn-hero-ghost" routerLink="/login">J&aacute; tenho uma conta</a>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }
}
