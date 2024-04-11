import { HttpInterceptorFn } from '@angular/common/http';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = '';

  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Token ${authToken}`
      }
    })
  }
  // Pass the cloned request with the updated header to the next handler
  return next(req);
};
