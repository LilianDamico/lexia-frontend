import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BillingService } from '../../core/services/billing.service';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, SubscriptionTier } from '../../core/models/billing.model';

interface FaqItem {
  question: string;
  answer:   string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Como funciona a cobrança?',
    answer:   'A cobrança é mensal, no cartão de crédito ou boleto bancário. Você recebe o acesso imediato após a confirmação do pagamento. Não há taxa de adesão nem cobranças ocultas.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:   'Sim. O cancelamento pode ser feito a qualquer momento pelo painel de configurações. Você mantém o acesso até o fim do período já pago e não é cobrado no ciclo seguinte.',
  },
  {
    question: 'Meus dados são privados?',
    answer:   'Absolutamente. Cada escritório opera em um tenant completamente isolado. Seus documentos, casos e informações de clientes nunca são compartilhados com outros escritórios nem utilizados para treinar modelos de IA.',
  },
  {
    question: 'Existe período de teste?',
    answer:   'Estamos estruturando um período de trial gratuito de 14 dias. Em breve esta funcionalidade estará disponível. Entre em contato para saber sobre acesso antecipado.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer:   'Sim. O upgrade é imediato — você paga apenas a diferença proporcional do mês atual. O downgrade entra em vigor no início do próximo ciclo de cobrança.',
  },
];

const COMPARISON_ROWS = [
  { label: 'Usuários',              key: 'users'             as const },
  { label: 'Consultas de IA',       key: 'aiQueries'         as const },
  { label: 'Agentes especializados',key: 'specializedAgents' as const },
  { label: 'RAG avançado',          key: 'advancedRag'       as const },
  { label: 'Armazenamento docs',    key: 'documentStorage'   as const },
  { label: 'Modelos jurídicos',     key: 'legalTemplates'    as const },
  { label: 'Dashboards',            key: 'dashboards'        as const },
  { label: 'Automações',            key: 'automations'       as const },
  { label: 'API',                   key: 'api'               as const },
  { label: 'Suporte',               key: 'support'           as const },
];

@Component({
  selector:    'LEXIA-pricing',
  standalone:  true,
  imports:     [RouterLink],
  styles: [`
    :host {
      --navy:      rgb(0, 0, 50);
      --navy-mid:  rgb(0, 0, 80);
      --navy-soft: rgb(10, 10, 70);
      --navy-card: rgba(255,255,255,0.035);
      --lime:      #b8ff3c;
      --lime-dim:  #94cc2e;
      --lime-pale: rgba(184,255,60,0.10);
      --white:     #ffffff;
      --off-white: #f7f8fc;
      --muted:     rgba(255,255,255,0.58);
      --border:    rgba(184,255,60,0.12);
      --border-hl: rgba(184,255,60,0.55);
      display: block;
      font-family: 'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
      background: var(--navy);
    }

    /* ── Hero ─────────────────────────────────────────────── */
    .hero {
      min-height: 76vh;
      background: var(--navy);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6rem 4% 4rem;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -200px; left: 50%;
      transform: translateX(-50%);
      width: 960px; height: 960px;
      background: radial-gradient(circle, rgba(184,255,60,0.07) 0%, transparent 62%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      border: 1px solid rgba(184,255,60,0.30);
      color: var(--lime);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 2rem;
    }
    .hero-badge-dot {
      width: 6px; height: 6px;
      background: var(--lime);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.25; }
    }
    .hero-title {
      font-size: clamp(2.6rem, 6vw, 4.8rem);
      font-weight: 800;
      color: var(--white);
      line-height: 1.07;
      letter-spacing: -0.04em;
      margin: 0 0 1.25rem;
      max-width: 780px;
    }
    .hero-title em { font-style: normal; color: var(--lime); }
    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.2rem);
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      max-width: 600px;
      line-height: 1.5;
      margin: 0 0 0.75rem;
    }
    .hero-text {
      font-size: 1rem;
      color: var(--muted);
      max-width: 560px;
      line-height: 1.75;
      margin: 0 0 2.5rem;
    }
    .btn-hero-primary {
      background: var(--lime);
      color: var(--navy);
      font-weight: 700;
      font-size: 1rem;
      padding: 0.9rem 2.2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s;
      display: inline-block;
    }
    .btn-hero-primary:hover { background: var(--lime-dim); transform: translateY(-2px); }

    /* ── Seção genérica ───────────────────────────────────── */
    .section {
      padding: 5.5rem 4%;
    }
    .section-dark  { background: var(--navy-soft); }
    .section-light { background: var(--off-white); }
    .section-navy  { background: var(--navy); }
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .section-label {
      display: inline-block;
      background: var(--lime-pale);
      color: var(--lime);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.3rem 0.85rem;
      border-radius: 999px;
      margin-bottom: 1rem;
    }
    .section-label-dark {
      background: rgba(0,0,50,0.08);
      color: var(--navy);
    }
    .section-title {
      font-size: clamp(1.9rem, 4vw, 2.9rem);
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
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .section-desc-dark { color: rgba(0,0,50,0.60); }

    /* ── Cards de planos ──────────────────────────────────── */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      max-width: 1240px;
      margin: 0 auto;
      align-items: start;
    }
    .plan-card {
      background: var(--navy-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .plan-card:hover {
      border-color: rgba(184,255,60,0.35);
      transform: translateY(-4px);
      box-shadow: 0 24px 48px rgba(0,0,0,0.3);
    }
    .plan-card.highlighted {
      border-color: var(--lime);
      background: rgba(184,255,60,0.04);
      box-shadow: 0 0 0 1px var(--lime), 0 20px 60px rgba(184,255,60,0.12);
    }
    .plan-badge {
      position: absolute;
      top: -14px; left: 50%;
      transform: translateX(-50%);
      background: var(--lime);
      color: var(--navy);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.28rem 0.9rem;
      border-radius: 999px;
      white-space: nowrap;
    }
    .plan-header { margin-bottom: 1.5rem; }
    .plan-name {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--white);
      letter-spacing: -0.01em;
      margin: 0 0 0.3rem;
    }
    .plan-audience {
      font-size: 0.82rem;
      color: var(--muted);
      margin: 0 0 1.25rem;
    }
    .plan-price-row {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
      margin-bottom: 0.5rem;
    }
    .plan-price {
      font-size: 2.4rem;
      font-weight: 800;
      color: var(--white);
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .plan-price-note {
      font-size: 0.9rem;
      color: var(--muted);
      font-weight: 500;
    }
    .plan-price.enterprise-price {
      font-size: 1.5rem;
      letter-spacing: -0.02em;
    }
    .plan-desc {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.65;
      margin: 0;
    }
    .plan-divider {
      height: 1px;
      background: var(--border);
      margin: 1.5rem 0;
    }
    .plan-benefits {
      list-style: none;
      margin: 0 0 2rem;
      padding: 0;
      display: grid;
      gap: 0.65rem;
      flex: 1;
    }
    .plan-benefit {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: rgba(255,255,255,0.80);
      line-height: 1.4;
    }
    .benefit-icon {
      flex-shrink: 0;
      width: 18px; height: 18px;
      background: var(--lime-pale);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--lime);
      font-size: 0.65rem;
      font-weight: 900;
      margin-top: 1px;
    }
    .plan-cta {
      display: block;
      text-align: center;
      padding: 0.85rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: background 0.2s, transform 0.15s, opacity 0.2s;
      width: 100%;
    }
    .plan-cta-primary {
      background: var(--lime);
      color: var(--navy);
    }
    .plan-cta-primary:hover { background: var(--lime-dim); transform: translateY(-1px); }
    .plan-cta-outline {
      background: transparent;
      color: var(--white);
      border: 1.5px solid rgba(255,255,255,0.25);
    }
    .plan-cta-outline:hover { border-color: var(--lime); color: var(--lime); }
    .plan-cta-enterprise {
      background: transparent;
      color: var(--lime);
      border: 1.5px solid var(--lime);
    }
    .plan-cta-enterprise:hover { background: var(--lime-pale); }

    /* ── Tabela comparativa ───────────────────────────────── */
    .compare-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      overflow-x: auto;
      border-radius: 16px;
      border: 1px solid rgba(0,0,50,0.10);
    }
    .compare-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 680px;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
    }
    .compare-table th {
      padding: 1.1rem 1rem;
      font-size: 0.82rem;
      font-weight: 800;
      text-align: center;
      background: var(--navy);
      color: var(--white);
      letter-spacing: -0.01em;
    }
    .compare-table th:first-child {
      text-align: left;
      background: rgb(0,0,35);
      color: rgba(255,255,255,0.55);
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      width: 200px;
    }
    .compare-table th.col-highlight {
      background: rgba(184,255,60,0.12);
      color: var(--lime);
    }
    .compare-table td {
      padding: 0.9rem 1rem;
      font-size: 0.88rem;
      text-align: center;
      border-bottom: 1px solid #f0f3f8;
      color: #334155;
    }
    .compare-table td:first-child {
      text-align: left;
      font-weight: 600;
      color: #172033;
      background: #fafbfd;
    }
    .compare-table td.col-highlight {
      background: rgba(184,255,60,0.04);
    }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td { background: #f7faff; }
    .compare-table tr:hover td.col-highlight { background: rgba(184,255,60,0.07); }
    .check { color: #16a34a; font-weight: 800; font-size: 1rem; }
    .cross { color: #cbd5e1; font-size: 1rem; }
    .text-val { color: #334155; font-weight: 600; font-size: 0.82rem; }

    /* ── FAQ ──────────────────────────────────────────────── */
    .faq-list {
      max-width: 760px;
      margin: 0 auto;
      display: grid;
      gap: 0.75rem;
    }
    .faq-item {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item.open { border-color: rgba(184,255,60,0.35); }
    .faq-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.35rem;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      font-size: 0.97rem;
      font-weight: 700;
      color: var(--white);
      line-height: 1.4;
    }
    .faq-chevron {
      flex-shrink: 0;
      width: 22px; height: 22px;
      background: var(--lime-pale);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--lime);
      font-size: 0.75rem;
      font-weight: 900;
      transition: transform 0.25s;
    }
    .faq-item.open .faq-chevron { transform: rotate(180deg); }
    .faq-answer {
      padding: 0 1.35rem 1.1rem;
      font-size: 0.92rem;
      color: var(--muted);
      line-height: 1.75;
    }

    /* ── CTA final ────────────────────────────────────────── */
    .cta-section {
      background: var(--navy-soft);
      text-align: center;
      padding: 6rem 4%;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-top: 1px solid var(--border);
    }
    .cta-title {
      font-size: clamp(1.9rem, 4vw, 3rem);
      font-weight: 800;
      color: var(--white);
      letter-spacing: -0.04em;
      margin: 0.5rem 0 1rem;
      line-height: 1.1;
    }
    .cta-desc {
      font-size: 1.05rem;
      color: var(--muted);
      max-width: 500px;
      line-height: 1.7;
      margin: 0 0 2.5rem;
    }
    .cta-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .btn-cta-ghost {
      padding: 0.9rem 2rem;
      border-radius: 8px;
      border: 1.5px solid rgba(255,255,255,0.25);
      color: var(--white);
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s;
      display: inline-block;
    }
    .btn-cta-ghost:hover { border-color: var(--lime); background: rgba(184,255,60,0.05); }

    /* ── Rodapé da página ─────────────────────────────────── */
    .pricing-footer {
      background: rgb(0,0,35);
      border-top: 1px solid rgba(184,255,60,0.08);
      text-align: center;
      padding: 1.5rem 4%;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.35);
      font-family: 'Inter', sans-serif;
    }
    .pricing-footer strong { color: rgba(255,255,255,0.55); }

    /* ── Responsividade ───────────────────────────────────── */
    @media (max-width: 900px) {
      .plans-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    }
    @media (max-width: 640px) {
      .hero    { padding: 5rem 5% 3rem; }
      .section { padding: 4rem 5%; }
      .plan-card { padding: 1.75rem 1.35rem; }
    }
  `],
  template: `
    <!-- ═══════════════════════════ HERO ═══════════════════════════════════ -->
    <section class="hero">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        Planos & Preços
      </div>

      <h1 class="hero-title">
        <em>LEXIA</em> IA Jur&iacute;dica
      </h1>

      <p class="hero-subtitle">
        A intelig&ecirc;ncia artificial que trabalha ao lado do seu escrit&oacute;rio.
      </p>

      <p class="hero-text">
        Automatize pesquisas, organize conhecimento jur&iacute;dico
        e produza documentos em minutos.
      </p>

      <a class="btn-hero-primary" routerLink="/register">
        Come&ccedil;ar Agora &#x203A;
      </a>
    </section>

    <!-- ═══════════════════════ CARDS DE PLANOS ════════════════════════════ -->
    <section class="section section-dark" aria-labelledby="plans-heading">
      <div class="section-header">
        <span class="section-label">Escolha seu plano</span>
        <h2 class="section-title" id="plans-heading">
          Intelig&ecirc;ncia jur&iacute;dica<br>no seu ritmo
        </h2>
        <p class="section-desc">
          Do advogado aut&ocirc;nomo ao grande escrit&oacute;rio. Sem burocracia, sem contratos longos.
        </p>
      </div>

      <div class="plans-grid">
        @for (plan of plans; track plan.id) {
          <article
            class="plan-card"
            [class.highlighted]="plan.highlighted"
            [attr.aria-label]="'Plano ' + plan.name"
          >
            @if (plan.badge) {
              <div class="plan-badge">{{ plan.badge }}</div>
            }

            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-audience">{{ plan.targetAudience }}</p>

              <div class="plan-price-row">
                <span
                  class="plan-price"
                  [class.enterprise-price]="plan.id === SubscriptionTier.ENTERPRISE"
                >
                  {{ plan.price }}
                </span>
                @if (plan.priceNote) {
                  <span class="plan-price-note">{{ plan.priceNote }}</span>
                }
              </div>

              <p class="plan-desc">{{ plan.description }}</p>
            </div>

            <div class="plan-divider"></div>

            <ul class="plan-benefits">
              @for (benefit of plan.benefits; track benefit) {
                <li class="plan-benefit">
                  <span class="benefit-icon" aria-hidden="true">&#10003;</span>
                  {{ benefit }}
                </li>
              }
            </ul>

            <button
              type="button"
              class="plan-cta"
              [class.plan-cta-primary]="plan.highlighted"
              [class.plan-cta-outline]="!plan.highlighted && plan.id !== SubscriptionTier.ENTERPRISE"
              [class.plan-cta-enterprise]="plan.id === SubscriptionTier.ENTERPRISE"
              (click)="onPlanCtaClick(plan)"
              [attr.aria-label]="plan.ctaLabel + ' — Plano ' + plan.name"
            >
              {{ plan.ctaLabel }}
            </button>
          </article>
        }
      </div>
    </section>

    <!-- ════════════════════ COMPARATIVO DE RECURSOS ══════════════════════ -->
    <section class="section section-light" aria-labelledby="compare-heading">
      <div class="section-header">
        <span class="section-label section-label-dark">Comparativo</span>
        <h2 class="section-title section-title-dark" id="compare-heading">
          Todos os recursos,<br>lado a lado
        </h2>
        <p class="section-desc section-desc-dark">
          Compare os planos e encontre o que melhor se encaixa na realidade do seu escrit&oacute;rio.
        </p>
      </div>

      <div class="compare-wrapper">
        <table class="compare-table" aria-label="Tabela comparativa de planos">
          <thead>
            <tr>
              <th scope="col">Recurso</th>
              @for (plan of plans; track plan.id) {
                <th
                  scope="col"
                  [class.col-highlight]="plan.highlighted"
                >
                  {{ plan.name }}
                  @if (plan.badge) {
                    <br><small style="font-size:0.68rem;opacity:0.8">{{ plan.badge }}</small>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of comparisonRows; track row.label) {
              <tr>
                <td>{{ row.label }}</td>
                @for (plan of plans; track plan.id) {
                  <td [class.col-highlight]="plan.highlighted">
                    {{ renderFeature(plan, row.key) }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════════════════ FAQ ═══════════════════════════════════ -->
    <section class="section section-navy" aria-labelledby="faq-heading">
      <div class="section-header">
        <span class="section-label">D&uacute;vidas frequentes</span>
        <h2 class="section-title" id="faq-heading">Perguntas & Respostas</h2>
      </div>

      <div class="faq-list" role="list">
        @for (item of faqItems; track item.question; let i = $index) {
          <div
            class="faq-item"
            [class.open]="openFaq() === i"
            role="listitem"
          >
            <button
              type="button"
              class="faq-question"
              (click)="toggleFaq(i)"
              [attr.aria-expanded]="openFaq() === i"
              [attr.aria-controls]="'faq-answer-' + i"
            >
              {{ item.question }}
              <span class="faq-chevron" aria-hidden="true">&#9660;</span>
            </button>

            @if (openFaq() === i) {
              <div
                class="faq-answer"
                [id]="'faq-answer-' + i"
                role="region"
              >
                {{ item.answer }}
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- ════════════════════════ CTA FINAL ════════════════════════════════ -->
    <section class="cta-section" aria-labelledby="cta-heading">
      <span class="section-label">Pronto para come&ccedil;ar?</span>
      <h2 class="cta-title" id="cta-heading">
        Eleve o n&iacute;vel<br>do seu escrit&oacute;rio
      </h2>
      <p class="cta-desc">
        Junte-se a escrit&oacute;rios que j&aacute; operam com intelig&ecirc;ncia jur&iacute;dica real.
        Escolha um plano e comece hoje.
      </p>
      <div class="cta-actions">
        <a class="btn-hero-primary" routerLink="/register">Criar conta &#x203A;</a>
        <a class="btn-cta-ghost" routerLink="/login">J&aacute; tenho uma conta</a>
      </div>
    </section>

    <!-- ═══════════════════════ RODAPÉ DA PÁGINA ══════════════════════════ -->
    <div class="pricing-footer">
      <strong>LEXIA</strong> &bull; Intelig&ecirc;ncia Artificial para o Direito
    </div>
  `,
})
export class PricingComponent implements OnInit {
  private readonly title   = inject(Title);
  private readonly meta    = inject(Meta);
  private readonly billing = inject(BillingService);

  readonly plans           = SUBSCRIPTION_PLANS;
  readonly comparisonRows  = COMPARISON_ROWS;
  readonly faqItems        = FAQ_ITEMS;
  readonly SubscriptionTier = SubscriptionTier;

  readonly openFaq = signal<number | null>(null);

  ngOnInit(): void {
    this.title.setTitle('Planos e Preços — LEXIA IA Jurídica');

    this.meta.updateTag({ name: 'description', content: 'Escolha o plano LEXIA ideal para o seu escritório de advocacia. IA jurídica com pesquisa inteligente, geração de petições e gestão de casos.' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title',       content: 'Planos e Preços — LEXIA IA Jurídica' });
    this.meta.updateTag({ property: 'og:description',  content: 'A inteligência artificial que trabalha ao lado do seu escritório. Planos a partir de R$ 97/mês.' });
    this.meta.updateTag({ property: 'og:type',         content: 'website' });
    this.meta.updateTag({ property: 'og:url',          content: 'https://LEXIA.com.br/pricing' });
    this.meta.updateTag({ property: 'og:image',        content: 'https://LEXIA.com.br/assets/og-pricing.png' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: 'LEXIA — IA Jurídica para o seu escritório' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Pesquisa jurídica inteligente, geração de petições e gestão de casos. Planos a partir de R$ 97/mês.' });
  }

  toggleFaq(index: number): void {
    this.openFaq.update(current => current === index ? null : index);
  }

  onPlanCtaClick(plan: SubscriptionPlan): void {
    if (plan.id === SubscriptionTier.ENTERPRISE) {
      this.billing.contactEnterprise();
    } else {
      this.billing.subscribe(plan.id);
    }
  }

  /**
   * Converte o valor de uma feature em representação textual para a tabela.
   * Boolean → ✓ / — | string → valor diretamente.
   */
  renderFeature(plan: SubscriptionPlan, key: string): string {
    const value = (plan.features as unknown as Record<string, unknown>)[key];
    if (typeof value === 'boolean') {
      return value ? '✓' : '—';
    }
    return String(value ?? '—');
  }
}
