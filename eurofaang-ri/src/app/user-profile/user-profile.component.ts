import {Component, OnInit} from '@angular/core';
import {UserProfile} from "../user-profile";
import {UserProfileService} from "../user-profile.service";
import {ActivatedRoute} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{
  userProfile: UserProfile|null = null;
  constructor(private userProfileService: UserProfileService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.userProfileService.getUserProfile(userId).subscribe({
      next: (data) => {
        console.log(data);
        this.userProfile = data as UserProfile;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
