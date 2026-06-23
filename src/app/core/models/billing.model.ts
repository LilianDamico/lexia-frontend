/**
 * Domínio de assinaturas e cobrança — LEXIA.
 *
 * Este módulo define os contratos do domínio de billing.
 * A implementação dos gateways de pagamento (Stripe, Mercado Pago, Asaas)
 * deve ser feita em adaptadores que implementem a interface PaymentProvider.
 */

// ── Enum de planos ────────────────────────────────────────────────────────────

export enum SubscriptionTier {
  STARTER      = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  OFFICE       = 'OFFICE',
  ENTERPRISE   = 'ENTERPRISE',
}

// ── Matriz de recursos por plano (usada na tabela comparativa) ────────────────

export interface PlanFeatures {
  users:               string;
  aiQueries:           string;
  specializedAgents:   boolean;
  advancedRag:         boolean;
  documentStorage:     boolean;
  legalTemplates:      boolean;
  dashboards:          boolean;
  automations:         boolean;
  api:                 string;   // 'Não' | 'Futura' | 'Disponível'
  orgMemory:           boolean;
  support:             string;
}

// ── Plano de assinatura ───────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id:            SubscriptionTier;
  name:          string;
  price:         string;
  priceNote:     string;
  targetAudience: string;
  description:   string;
  benefits:      string[];
  features:      PlanFeatures;
  highlighted:   boolean;
  badge:         string | null;
  ctaLabel:      string;
}

// ── Catálogo de planos ────────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id:             SubscriptionTier.STARTER,
    name:           'Starter',
    price:          'R$ 97',
    priceNote:      '/mês',
    targetAudience: 'Advogado autônomo',
    description:    'A base completa para o advogado que quer operar com inteligência.',
    benefits: [
      '1 usuário',
      'Assistente jurídico com IA',
      'Pesquisa jurídica inteligente',
      'Geração de petições',
      'Base de conhecimento pessoal',
      'Armazenamento de documentos',
      'Até 500 consultas de IA por mês',
      'Suporte por e-mail',
    ],
    features: {
      users:             '1',
      aiQueries:         '500 / mês',
      specializedAgents: false,
      advancedRag:       false,
      documentStorage:   true,
      legalTemplates:    false,
      dashboards:        false,
      automations:       false,
      api:               'Não',
      orgMemory:         false,
      support:           'E-mail',
    },
    highlighted: false,
    badge:       null,
    ctaLabel:    'Assinar',
  },
  {
    id:             SubscriptionTier.PROFESSIONAL,
    name:           'Profissional',
    price:          'R$ 197',
    priceNote:      '/mês',
    targetAudience: 'Pequenos escritórios',
    description:    'Colaboração, agentes especializados e RAG avançado para o escritório que cresce.',
    benefits: [
      'Até 5 usuários',
      'Tudo do Starter',
      'Agentes especializados',
      'RAG avançado',
      'Biblioteca de modelos jurídicos',
      'Organização por clientes e processos',
      'Até 3.000 consultas de IA por mês',
      'Suporte prioritário',
    ],
    features: {
      users:             'Até 5',
      aiQueries:         '3.000 / mês',
      specializedAgents: true,
      advancedRag:       true,
      documentStorage:   true,
      legalTemplates:    true,
      dashboards:        false,
      automations:       false,
      api:               'Não',
      orgMemory:         false,
      support:           'Prioritário',
    },
    highlighted: true,
    badge:       'Mais Popular',
    ctaLabel:    'Assinar',
  },
  {
    id:             SubscriptionTier.OFFICE,
    name:           'Escritório',
    price:          'R$ 397',
    priceNote:      '/mês',
    targetAudience: 'Escritórios de médio porte',
    description:    'Gestão avançada, automações e memória organizacional para escalar com controle.',
    benefits: [
      'Usuários ilimitados',
      'Tudo do Profissional',
      'Gestão documental avançada',
      'Dashboards',
      'Automações',
      'API futura',
      'Memória organizacional do escritório',
      'Até 10.000 consultas de IA por mês',
      'Suporte premium',
    ],
    features: {
      users:             'Ilimitados',
      aiQueries:         '10.000 / mês',
      specializedAgents: true,
      advancedRag:       true,
      documentStorage:   true,
      legalTemplates:    true,
      dashboards:        true,
      automations:       true,
      api:               'Futura',
      orgMemory:         true,
      support:           'Premium',
    },
    highlighted: false,
    badge:       null,
    ctaLabel:    'Assinar',
  },
  {
    id:             SubscriptionTier.ENTERPRISE,
    name:           'Enterprise',
    price:          'Sob consulta',
    priceNote:      '',
    targetAudience: 'Grandes escritórios e departamentos jurídicos',
    description:    'Infraestrutura dedicada, personalizações e SLA para operações de alta exigência.',
    benefits: [
      'Infraestrutura dedicada',
      'Personalizações exclusivas',
      'SLA diferenciado',
      'Integrações exclusivas',
      'Treinamento presencial',
      'Consultoria especializada',
      'Limites sob demanda',
    ],
    features: {
      users:             'Ilimitados',
      aiQueries:         'Sob demanda',
      specializedAgents: true,
      advancedRag:       true,
      documentStorage:   true,
      legalTemplates:    true,
      dashboards:        true,
      automations:       true,
      api:               'Disponível',
      orgMemory:         true,
      support:           'Dedicado',
    },
    highlighted: false,
    badge:       null,
    ctaLabel:    'Falar com Especialista',
  },
];

// ── Contrato do gateway de pagamento (Port — Arquitetura Hexagonal) ───────────

export interface PaymentProvider {
  /** Nome do provedor para identificação e logs. */
  readonly name: 'stripe' | 'mercado_pago' | 'asaas';

  /**
   * Inicia o fluxo de checkout para o plano informado.
   * Implementar em cada adaptador de gateway.
   */
  initCheckout(
    planId:  SubscriptionTier,
    options?: Record<string, unknown>,
  ): Promise<void>;

  /**
   * Cancela a assinatura ativa do usuário corrente.
   */
  cancelSubscription(subscriptionId: string): Promise<void>;
}
