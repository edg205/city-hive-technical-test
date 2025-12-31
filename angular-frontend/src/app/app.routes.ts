import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { MessagesComponent } from './messages/messages.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'messages', component: MessagesComponent },
  { path: '**', redirectTo: 'auth' }
];
