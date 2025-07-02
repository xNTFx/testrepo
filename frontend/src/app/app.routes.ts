import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { LoginPageComponent } from './features/login-page/login-page.component';
import { RegisterPageComponent } from './features/register-page/register-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
];
