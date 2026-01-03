import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { MessagesComponent } from './messages/messages.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' },
];
