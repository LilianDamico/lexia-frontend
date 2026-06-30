import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
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
  selector:    'lexia-pricing',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
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
    this.meta.updateTag({ property: 'og:url',          content: `${environment.appUrl}/pricing` });
    this.meta.updateTag({ property: 'og:image',        content: `${environment.appUrl}/assets/og-pricing.png` });

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
