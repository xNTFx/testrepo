import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

interface User {
  id: string;
  username: string;
  role: string;
}

export interface MeResponse {
  authenticated: boolean;
  user: {
    id: string;
    username: string;
    role: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:5194';

  private currentUserSignal = signal<User | null>(null);
  currentUser = computed(() => this.currentUserSignal());

  constructor(private http: HttpClient) {}

  register(username: string, password: string, confirmPassword: string) {
    return this.http
      .post<User>(
        `${this.API_URL}/api/auth/register`,
        { username, password, confirmPassword },
        { withCredentials: true }
      )
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  login(username: string, password: string) {
    return this.http
      .post<User>(
        `${this.API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  logout() {
    return this.http
      .post(`${this.API_URL}/api/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUserSignal.set(null)));
  }

  me() {
    return this.http
      .get<MeResponse>(`${this.API_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.currentUserSignal.set(res.user);
        }),
        catchError(() => {
          this.currentUserSignal.set(null);
          return of(null);
        })
      );
  }

  refreshToken() {
    return this.http.post(
      `${this.API_URL}/api/auth/refresh-token`,
      {},
      {
        responseType: 'text',
        withCredentials: true,
      }
    );
  }

  getCurrentUserSignal() {
    return this.currentUserSignal;
  }
}
