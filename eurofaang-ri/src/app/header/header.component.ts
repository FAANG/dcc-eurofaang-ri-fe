import { Component } from '@angular/core';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ApiService} from '../services/api.service';
import {UserProfileService} from "../services/user-profile.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
    imports: [MatToolbarModule, MatButton, MatIcon],
  providers: [ApiService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private apiService: ApiService) {}

  logOut() {
    this.apiService.logOut();
  }
}
