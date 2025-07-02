import { Component, OnInit, signal, Signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LucideAngularModule, CircleUserRound } from 'lucide-angular';
import { MatMenuModule } from '@angular/material/menu';

interface User {
  id: string;
  username: string;
  role: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  imports: [RouterLink, LucideAngularModule, MatMenuModule],
})
export class NavbarComponent implements OnInit {
  readonly user: Signal<User | null>;
  message = signal<string | null>(null);

  readonly circleUserRound = CircleUserRound;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.user = this.authService.getCurrentUserSignal();
  }

  ngOnInit() {
    this.authService.me().subscribe();

    const state = window.history.state as { message?: string };

    if (state?.message) {
      this.message.set(state.message);
      this.snackBar.open(state.message, 'x', { duration: 3000 });
      window.history.replaceState({}, document.title);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () =>
        this.router.navigate(['/'], {
          state: { message: 'you have logged out successfully' },
        }),
      error: (err) => console.error('logout fail:', err),
    });
  }
}
