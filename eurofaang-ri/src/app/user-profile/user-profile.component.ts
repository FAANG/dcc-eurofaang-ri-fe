import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {UserProfile} from "../user-profile";
import {UserProfileService} from "../services/user-profile.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {ApiService} from '../services/api.service';
import {MatFormField} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatPaginator} from "@angular/material/paginator";
import {MatPaginatorModule} from '@angular/material/paginator';
import {Location} from '@angular/common';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatIcon} from "@angular/material/icon";


export interface TnaDisplayInterface {
  title: string;
  id: number;
  pi: string;
  connected: string;
  tnaOwner: number;
  status: string;
  enableEdit: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatListModule, MatTableModule, RouterLink,
    MatFormField, FormsModule, MatFormFieldModule, MatInputModule, MatPaginator, MatPaginatorModule, MatSortModule, MatIcon],
  providers: [ApiService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  userProfile: UserProfile | null = null;
  displayedColumns: string[] = ['id', 'title', 'pi', 'connected', 'status', 'actions'];
  projectsList: TnaDisplayInterface[] = [];
  timer: any;
  totalHits = 0;
  urlTree: string = '';
  location: Location;
  queryParams: any = {};
  currentSearchTerm: string = '';
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator = <MatPaginator>{};
  @ViewChild(MatSort) sort: MatSort = <MatSort>{};

  constructor(private userProfileService: UserProfileService,
              private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,
              location: Location) {
    this.location = location;
  }


  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.userProfileService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.userProfile = data as UserProfile;
      },
      error: (error) => {
        console.log(error);
      }
    });
    this.sort.active = 'id';
    this.sort.direction = 'asc';
    this.getTnaProjects('', 0, true, 'id', 'asc');

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTnaProjects(searchTerm: string, pageNumber: number, pagination: boolean, sortTerm: string, sortDirection: string) {
    this.apiService.getTnaProjects(searchTerm, pageNumber, true, sortTerm, sortDirection).subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            connected: entry['associated_application'],
            connectedProject: entry['associated_application_title'],
            tnaOwner: parseInt(entry['tna_owner']),
            status: entry['record_status'],
            enableEdit: this.userProfile ? parseInt(entry['tna_owner']) === parseInt(this.userProfile['id'])
              && entry['record_status'] != 'submitted' : false,
          } as TnaDisplayInterface));
          // this.dataSource = new MatTableDataSource<any>(this.projectsList);
          this.dataSource.data = this.projectsList;
          this.dataSource.sort = this.sort;
          this.totalHits = data['count'];
        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {

        }
      }
    );
  }

  searchChanged(event: any) {
    const searchFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.applySearchFilter.bind(this), 500, searchFilterValue);
  }

  applySearchFilter(searchTerm: string) {
    this.getTnaProjects(searchTerm, 1, true, 'id', 'asc');
  }

  customSort(event: any) {
    this.getTnaProjects(this.currentSearchTerm, 1, true, this.getApiTerm(event.active), event.direction)
  }

  getApiTerm(term: string) {
    const apiTerms: { [index: string]: any } = {
      title: 'project_title'
    }
    return apiTerms[term];
  }

  onPageChange(event: any) {
    const currentPage = +event.pageIndex + 1;
    this.getTnaProjects(this.currentSearchTerm, currentPage, true, this.getApiTerm(this.sort.active), this.sort.direction)
  }
}




