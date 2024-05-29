import { HttpInterceptorFn } from '@angular/common/http';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

  if (userData.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Token ${userData.token}`
      }
    })
  }
  // Pass the cloned request with the updated header to the next handler
  return next(req);
};
