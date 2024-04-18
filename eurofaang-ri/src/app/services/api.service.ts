import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpBackend} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient,
              handler: HttpBackend) {
    // service is not intercepted by AuthInterceptor.
    this.http = new HttpClient(handler);
  }

  getCountries(){
    const url = ' https://raw.githubusercontent.com/FAANG/dcc-metadata/master/json_schema/type/samples/faang_samples_specimen.metadata_rules.json';
    return this.http.get(url).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof HttpErrorResponse) {
      console.error('An errorSubject occurred:', error.error.message);
    } else {
      console.error(error);
    }
    return throwError(() => error);
  }

}
