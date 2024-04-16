import {Component, OnInit} from '@angular/core';
import {UserProfile} from "../user-profile";
import {UserProfileService} from "../user-profile.service";
import {ActivatedRoute} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatTableModule} from "@angular/material/table";

export interface PeriodicElement {
  title: string;
  position: number;
  pi: string;
  connected: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, title: 'TNA test application 1', pi: 'Principal Investigator 1', connected: 'No'},
  {position: 2, title: 'TNA test application 2', pi: 'Principal Investigator 2', connected: 'Yes'},
];

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatListModule, MatTableModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{
  userProfile: UserProfile|null = null;
  displayedColumns: string[] = ['position', 'title', 'pi', 'connected'];
  dataSource = ELEMENT_DATA;


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
