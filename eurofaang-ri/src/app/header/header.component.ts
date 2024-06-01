import { Component } from '@angular/core';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ApiService} from '../services/api.service';
import {UserProfileService} from "../services/user-profile.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location, NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButton, MatIcon, NgIf],
  providers: [ApiService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private apiService: ApiService) {}

  logOut() {
    this.apiService.logOut();
  }

  isLoggedIn() {
    return this.apiService.isLoggedIn();
  }
}
