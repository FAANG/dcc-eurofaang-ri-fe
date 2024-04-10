import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  logIn(username: string, password: string): Observable<any> {
    return this.http.post(
      'http://localhost:8080/api-user-login/', {username, password}
    ) as Observable<any>;
  }
}
