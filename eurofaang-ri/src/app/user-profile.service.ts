import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserProfile} from "./user-profile";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) { }

  getUserProfile(userId: string|null): Observable<UserProfile> {
    return this.http.get(`http://localhost:8000/api/v1/users/${userId}`) as Observable<UserProfile>;
  }
}
