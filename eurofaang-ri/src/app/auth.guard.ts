import {CanActivateFn, Router} from '@angular/router';
import {inject, Injectable} from "@angular/core";

@Injectable()
export class PermissionsService {

  constructor(private router: Router) { }

  canActivate(): boolean {
    if (sessionStorage.getItem("userData")) {
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermissionsService).canActivate();
};
