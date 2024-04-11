import { Routes } from '@angular/router';
import {UserLoginComponent} from "./user-login/user-login.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";

export const routes: Routes = [
  { path: 'login', component: UserLoginComponent },
  { path: 'user-profile/:id', component: UserProfileComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
