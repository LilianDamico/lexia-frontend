import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lexia-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css'
})
export class RootComponent {}
