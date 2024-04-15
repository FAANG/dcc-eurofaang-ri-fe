import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserProfile} from "./user-profile";
import {URL} from "./auth";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) { }

  getUserProfile(userId: string|null): Observable<UserProfile> {
    return this.http.get(`${URL}/api/v1/users/${userId}`) as Observable<UserProfile>;
  }
}
