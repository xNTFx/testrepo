import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          !this.isRefreshing
        ) {
          this.isRefreshing = true;
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              this.isRefreshing = false;
              return next.handle(req);
            }),
            catchError((refreshErr) => {
              this.isRefreshing = false;
              this.authService.logout().subscribe();
              return throwError(() => refreshErr);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }
}
