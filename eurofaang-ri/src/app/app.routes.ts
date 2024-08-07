import { Routes } from '@angular/router';
import {UserLoginComponent} from "./user-login/user-login.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {authGuard} from "./auth.guard";
import {TnaComponent} from "./tna/tna.component";
import {PageNotFoundComponent} from './page-not-found/page-not-found.component'
import {TnaViewComponent} from "./tna/tna-view/tna-view.component";


export const routes: Routes = [
  { path: 'login', component: UserLoginComponent, canActivate: [authGuard] },
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'tna/new', component: TnaComponent, canActivate: [authGuard],},
  { path: 'tna/edit/:id', component: TnaComponent, canActivate: [authGuard],},
  { path: 'tna/view/:id', component: TnaViewComponent, canActivate: [authGuard],},
  { path: '**', component: PageNotFoundComponent },
];
