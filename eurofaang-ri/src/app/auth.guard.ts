import {ActivatedRoute, CanActivateFn, Router} from '@angular/router';
import {Inject, inject, Injectable} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";
import { PLATFORM_ID } from '@angular/core';

@Injectable()
export class PermissionsService {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  canActivate(): boolean {
    if(isPlatformBrowser(this.platformId))//you are client side
    {
      if (sessionStorage.getItem("userData")) {
        return true;
      }
      this.router.navigateByUrl('/login');
      return false;
    }
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermissionsService).canActivate();
};
