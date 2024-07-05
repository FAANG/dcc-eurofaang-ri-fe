import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {Inject, inject, Injectable} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import { PLATFORM_ID } from '@angular/core';

@Injectable()
export class PermissionsService {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) { // you are client side
      const userData = sessionStorage.getItem("userData");
      const isLoginRoute = route.routeConfig?.path === 'login';
      if (userData) {
        const user = JSON.parse(userData);
        if (isLoginRoute) {
          this.router.navigate(['/user-profile', user.id]);
          return false;
        }
        return true;
      } else {
        if (!isLoginRoute) {
          this.router.navigateByUrl('/login');
          return false;
        }
        return true;
      }
    }
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermissionsService).canActivate(route);
};
