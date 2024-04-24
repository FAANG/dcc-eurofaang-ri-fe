import {Component, OnInit, AfterViewInit} from '@angular/core';
import {UserProfile} from "../user-profile";
import {UserProfileService} from "../user-profile.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {ApiService} from '../services/api.service';

export interface PeriodicElement {
  title: string;
  id: number;
  pi: string;
  connected: string;
}

// const ELEMENT_DATA: PeriodicElement[] = [
//   {id: 1, title: 'TNA test application 1', pi: 'Principal Investigator 1', connected: 'No'},
//   {id: 2, title: 'TNA test application 2', pi: 'Principal Investigator 2', connected: 'Yes'},
// ];

const ELEMENT_DATA: PeriodicElement[] = [
  {id: 1, title: 'TNA test application 1', pi: 'Principal Investigator 1', connected: 'No'},
  {id: 2, title: 'TNA test application 2', pi: 'Principal Investigator 2', connected: 'Yes'},
];

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatListModule, MatTableModule, RouterLink],
  providers: [ApiService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewInit{
  userProfile: UserProfile|null = null;
  displayedColumns: string[] = ['id', 'title', 'pi', 'connected'];
  projectsList: PeriodicElement[] = [];
  // dataSource = ELEMENT_DATA;
  dataSource: MatTableDataSource<any> =  new MatTableDataSource<any>([]);


  constructor(private userProfileService: UserProfileService,
              private activatedRoute: ActivatedRoute,
              private apiService: ApiService,) {}


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

    this.getTnaProjects();
  }

  ngAfterViewInit() {

  }

  getTnaProjects() {
    this.apiService.getTnaProjects().subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator'],
            connected: entry['associated_application']
          }as PeriodicElement));
          this.dataSource.data = this.projectsList;
        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
        }
      }
    );
  }

  getUserDetails(userId: number) {
    this.apiService.getUserDetails(userId).subscribe(
      {
        next: (data) => {
          const name = `${data['data']['first_name']} ${data['data']['last_name']}`
          console.log(data['data']['first_name'])
          return name;

        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
        }
      }
    );
  }
}




