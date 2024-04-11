import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {LoggedInUser} from "./auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  logIn(username: string, password: string): Observable<LoggedInUser> {
    return this.http.post(
      'http://localhost:8000/api-user-login/', {username, password}
    ) as Observable<LoggedInUser>;
  }

  setLoggedInUser(userData: LoggedInUser): void {
    if (sessionStorage.getItem('userData') !== JSON.stringify(userData)) {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
  }
}
