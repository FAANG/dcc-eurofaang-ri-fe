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
import {merge, startWith, switchMap, Observable, of as observableOf, pipe} from "rxjs";
import {catchError, map} from "rxjs/operators";


export interface TnaDisplayInterface {
  title: string;
  id: number;
  pi: string;
  connected: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatListModule, MatTableModule, RouterLink,
    MatFormField, FormsModule, MatFormFieldModule, MatInputModule, MatPaginator, MatPaginatorModule, MatSortModule],
  providers: [ApiService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  userProfile: UserProfile | null = null;
  displayedColumns: string[] = ['id', 'title', 'pi', 'connected'];
  projectsList: TnaDisplayInterface[] = [];
  // dataSource: MatTableDataSource<any> =  new MatTableDataSource<any>([]);
  // dataSource = new MatTableDataSource();
  timer: any;
  totalHits = 0;
  urlTree: string = '';
  location: Location;
  queryParams: any = {};
  currentSearchTerm: string = '';

  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = <MatPaginator>{};
  // @ViewChild('paginator') paginator: MatPaginator = <MatPaginator>{};


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
    // this.paginator.pageIndex = 0
    // extract query parameters
    // this.activatedRoute.queryParams.subscribe(params => {
    //   this.queryParams = {...params};
    // });

    // if (this.queryParams['pageIndex']){
    //   this.resetPagination(this.queryParams['pageIndex']);
    // }

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

    this.sort.active = 'id';
    this.sort.direction = 'asc';

    console.log(this.sort)

    this.getTnaProjects('', 0, 'id', 'asc');

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTnaProjects(searchTerm: string, pageNumber: number, sortTerm: string, sortDirection: string) {
    this.apiService.getTnaProjects(searchTerm, pageNumber, true, sortTerm, sortDirection).subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            connected: entry['associated_application'],
            connectedProject: entry['associated_application_title'],
          } as TnaDisplayInterface));
          console.log(data)

          // this.dataSourceRecords.sort = this.sort;
          this.dataSource = new MatTableDataSource<any>(this.projectsList);
          this.dataSource.sort = this.sort;
          this.totalHits = data['count'];

          console.log(this.sort)


        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
          console.log(this.paginator)
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

  searchChanged(event: any) {
    const searchFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.applySearchFilter.bind(this), 500, searchFilterValue);
  }

  applySearchFilter(searchTerm: string) {
    this.apiService.getTnaProjects(searchTerm, 1, true, 'id', 'asc').subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            connected: entry['associated_application'],
            connectedProject: entry['associated_application_title'],
          } as TnaDisplayInterface));
          this.dataSource.data = this.projectsList;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // this.paginator.pageIndex = 0;
            this.totalHits = data['count'];
          }, 50);
        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
        }
      }
    );
  }

  customSort(event: any) {
    console.log(event.active, event.direction)
    // this.paginator.pageIndex = 0;
    console.log(this.sort)

    this.getTnaProjects(this.currentSearchTerm, 1, this.getApiTerm(event.active), event.direction)
  }

  getApiTerm(term: string) {
    const apiTerms: { [index: string]: any } = {
      title: 'project_title'
    }
    return apiTerms[term];

  }


  onPageChange(event: any) {
    const currentPage = +event.pageIndex + 1;
    console.log(this.sort)
    this.getTnaProjects(this.currentSearchTerm, currentPage, this.getApiTerm(this.sort.active), this.sort.direction)
  }

  resetPagination(pageIndex: number) {
    if (pageIndex != 0) {
      this.queryParams['pageIndex'] = pageIndex;
      if (this.paginator) {
        this.paginator.pageIndex = pageIndex;
        // emit an event so that the table will refresh the data
        this.paginator.page.next({
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize,
          length: this.paginator.length
        });
      }

    }
  }
}




