import { Injectable } from '@angular/core';
import { PaymentProvider, SubscriptionTier } from '../models/billing.model';

/**
 * BillingService — Caso de Uso de Assinaturas.
 *
 * Orquestra o fluxo de assinatura sem conhecer os detalhes do gateway.
 * Para integrar um gateway (Stripe, Mercado Pago, Asaas), injete um
 * adaptador que implemente a interface PaymentProvider e substitua
 * o stub `_provider`.
 *
 * TODO: injetar PaymentProvider real via DI token quando o gateway for escolhido.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {

  /** Stub do provider — substituir pelo adaptador real no momento da integração. */
  private readonly _provider: PaymentProvider | null = null;

  /**
   * Inicia o fluxo de assinatura para o plano informado.
   *
   * Pontos de integração:
   *  - Stripe:        this._provider.initCheckout(tier, { mode: 'subscription' })
   *  - Mercado Pago:  this._provider.initCheckout(tier, { back_urls: { success: '...' } })
   *  - Asaas:         this._provider.initCheckout(tier, { billingType: 'CREDIT_CARD' })
   */
  subscribe(tier: SubscriptionTier): void {
    if (!this._provider) {
      // TODO: remover log e conectar ao gateway quando disponível
      console.info('[BillingService] subscribe() — gateway não configurado.', { tier });
      return;
    }
    void this._provider.initCheckout(tier);
  }

  /**
   * Abre o canal de contato para o plano Enterprise.
   *
   * Pontos de integração:
   *  - CRM (HubSpot, Pipedrive…)
   *  - Formulário Typeform / HubSpot Forms
   *  - E-mail direto via mailto:
   */
  contactEnterprise(): void {
    // TODO: integrar com CRM ou abrir modal de formulário
    console.info('[BillingService] contactEnterprise() — integração pendente.');
    window.open('mailto:comercial@LEXIA.com.br?subject=Interesse%20no%20Plano%20Enterprise', '_blank');
  }

  /**
   * Retorna true se o provider de pagamento está configurado.
   * Útil para exibir indicadores de indisponibilidade na UI.
   */
  isPaymentConfigured(): boolean {
    return this._provider !== null;
  }
}
