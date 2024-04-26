import { Routes } from '@angular/router';
import {UserLoginComponent} from "./user-login/user-login.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {authGuard} from "./auth.guard";
import {TnaComponent} from "./tna/tna.component";

export const routes: Routes = [
  { path: 'login', component: UserLoginComponent },
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: 'tna/new', component: TnaComponent},
  {path: 'tna/edit/:id', component: TnaComponent},
];
