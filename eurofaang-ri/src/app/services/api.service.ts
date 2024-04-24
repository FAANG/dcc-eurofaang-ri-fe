import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpBackend, HttpHeaders} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {URL} from "../auth";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions :{headers: HttpHeaders} = {
    headers: new HttpHeaders({
    })
  };

  constructor(private http: HttpClient,
              handler: HttpBackend) {
    // service is not intercepted by AuthInterceptor.
    this.http = new HttpClient(handler);

    // set authorisation token
    const userData: string | null = localStorage.getItem('userData');
    let token = '';
    if (userData) {
      token = JSON.parse(userData)['token'];
    }
    this.httpOptions = {
      headers: new HttpHeaders({
        "Authorization": "Token " + token
      })
    };
  }

  getCountries() {
    const url = 'https://raw.githubusercontent.com/FAANG/dcc-metadata/master/json_schema/type/samples/faang_samples_specimen.metadata_rules.json';
    return this.http.get(url).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }

  getTnaProjects() {
    const url = `${URL}/tna/list/`;
    const res: { [key: string]: any } = {}
    return this.http.get(url, this.httpOptions).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }

  getUserDetails(userId: number) {
    const url = `${URL}/users/${userId}`;
    const res: { [key: string]: any } = {}
    return this.http.get(url).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }

  createTnaProject(body: any) {
    const url = URL + '/tna/list/';
    return this.http.post(url, body, this.httpOptions).pipe(
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
