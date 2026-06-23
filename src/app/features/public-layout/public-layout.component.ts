import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'LEXIA-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .public-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `],
  template: `
    <LEXIA-navbar />
    <div class="public-content">
      <router-outlet />
    </div>
    <LEXIA-footer />
  `,
})
export class PublicLayoutComponent {}
