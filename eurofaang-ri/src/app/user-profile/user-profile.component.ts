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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatPaginator} from "@angular/material/paginator";
import { MatPaginatorModule } from '@angular/material/paginator';
import {Location} from '@angular/common';
import {MatSort} from "@angular/material/sort";

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
    MatFormField, FormsModule, MatFormFieldModule, MatInputModule, MatPaginator, MatPaginatorModule],
  providers: [ApiService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewInit{
  userProfile: UserProfile|null = null;
  displayedColumns: string[] = ['id', 'title', 'pi', 'connected'];
  projectsList: TnaDisplayInterface[] = [];
  dataSource: MatTableDataSource<any> =  new MatTableDataSource<any>([]);
  timer: any;
  totalHits = 0;
  urlTree: string = '';
  location: Location;
  queryParams: any = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = <MatPaginator>{};
  @ViewChild(MatSort, { static: true }) sort: MatSort = <MatSort>{};


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

    this.getTnaProjects('', 0);
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator
    // Reset back to the first page when sort order is changed
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);


    // merge(this.paginator.page) // this.sort.sortChange, this.paginator.page
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       // this.spinner.show();
    //       // if(this.sort.active && this.sort.direction) {
    //       //   this.query['sort'] = [this.sort.active, this.sort.direction];
    //       //   this.sortUpdate.emit(this.query['sort']);
    //       // } else {
    //       //   this.query['sort'] = this.defaultSort;
    //       // }
    //       // this.updateSortingUrlParameters(this.query['sort'][0], this.query['sort'][1]);
    //
    //       // this.query['from_'] = this.paginator.pageIndex * this.paginator.pageSize;
    //       return this.apiService.getTnaProjects('', 1,  true);
    //     }),
    //     map(data => {
    //       return data;
    //     }),
    //     catchError(() => {
    //       // this.spinner.hide();
    //       return observableOf([]);
    //     })
    //   ).subscribe((res: any) => {
    //   this.projectsList = res['data'].map((entry: { [x: string]: any; }) => ({
    //     id: entry['id'],
    //     title: entry['project_title'],
    //     pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
    //     connected: entry['associated_application'],
    //     connectedProject: entry['associated_application_title'],
    //   }as TnaDisplayInterface));
    //
    //   this.dataSource.data = this.projectsList;
    //   this.totalHits = res['count'];
    //   // this.spinner.hide();
    // });
  }

  getTnaProjects(searchTerm: string, pageNumber: number) {
    this.apiService.getTnaProjects(searchTerm, pageNumber,  true).subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            connected: entry['associated_application'],
            connectedProject: entry['associated_application_title'],
          }as TnaDisplayInterface));
          console.log(data)

          setTimeout(() => {
            // this.organismName = data.organism;
            // this.dataSourceRecords = new MatTableDataSource<any>(this.bioSampleObj.specimens);
            // this.specBioSampleTotalCount = unpackedData?.length;
            // this.dataSourceRecords.paginator = this.paginator;
            // this.dataSourceRecords.sort = this.sort;
            this.dataSource.data = this.projectsList;
            this.dataSource.paginator = this.paginator;
          }, 500);
          console.log("this.paginator.page: ", this.paginator)

          this.totalHits = data['count'];
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
    // reset query params before applying search

    this.apiService.getTnaProjects(searchTerm, 1, true).subscribe(
      {
        next: (data) => {
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            connected: entry['associated_application'],
            connectedProject: entry['associated_application_title'],
          }as TnaDisplayInterface));
          this.dataSource.data = this.projectsList;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.paginator.pageIndex = 0;
          }, 50);


          this.totalHits = data['count'];
        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
        }
      }
    );
    // Update query parameters to pass to route
    // this.updateUrlParameters(searchTerm, 'searchTerm')





  }

  onPageChange(event: any) {
    console.log(event)
    const currentPage = +event.pageIndex + 1;
    this.getTnaProjects('', currentPage);


    // const params = {
    //   pageIndex: this.paginator ? this.paginator.pageIndex : 0,
    // };
    // this.urlTree = this.router.createUrlTree([], {
    //   relativeTo: this.activatedRoute,
    //   queryParams: params,
    //   queryParamsHandling: 'merge',
    // }).toString();
    //
    // //Update route with Query Params
    // this.location.go(this.urlTree);
  }

  resetPagination(pageIndex: number) {
    if (pageIndex != 0) {
      this.queryParams['pageIndex'] = pageIndex;
      if (this.paginator){
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




