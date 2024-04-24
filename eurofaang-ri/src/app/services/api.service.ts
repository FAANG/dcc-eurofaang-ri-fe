import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpBackend, HttpHeaders} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
const HOST = "http://127.0.0.1:8000";

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


  getTnaProjects() {
    const userData: string | null = localStorage.getItem('userData');
    let token = '';
    if (userData) {
      token =  JSON.parse(userData)['token'];
    }
    const httpOptions = {
      headers: new HttpHeaders({
        "Authorization": "Token " + token
      })
    };
    const url = `${HOST}/tna/list/`;
    const res: {[key: string]: any} = {}
    return this.http.get(url, httpOptions).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }

  getUserDetails(userId: number) {
    const url = `${HOST}/users/${userId}`;
    const res: {[key: string]: any} = {}
    return this.http.get(url).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }


  createTnaProject(body: any) {
    const url = HOST + '/tna/list/';
    return this.http.post(url, body).pipe(
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
