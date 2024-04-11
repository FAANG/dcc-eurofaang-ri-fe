import { HttpInterceptorFn } from '@angular/common/http';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = '7e1831df203cb5f74b163ee9599567c7f504a84e';

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
