import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {UserProfile} from "../user-profile";
import {UserProfileService} from "../services/user-profile.service";
import {ActivatedRoute, Params, Router, RouterLink} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {CommonModule, NgIf} from "@angular/common";
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
    MatFormField, FormsModule, MatFormFieldModule, MatInputModule, MatPaginator, MatPaginatorModule, MatSortModule,
    MatIcon, NgIf],
  providers: [ApiService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  userProfile: UserProfile | null = null;
  displayedColumns: string[] = ['title', 'pi', 'participants', 'connected', 'status', 'actions'];
  projectsList: TnaDisplayInterface[] = [];
  timer: any;
  totalHits = 0;
  location: Location;
  queryParams: any = {};
  currentSearchTerm: string = '';
  sortTerm: string = '';
  sortDirection: string = '';
  defaultPageSize: number = 10;
  defaultPageNumber: number = 1;

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator = <MatPaginator>{};
  @ViewChild(MatSort) sort: MatSort = <MatSort>{};
  private userId: string | null = '';

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
        if (data && Object.keys(data).length > 0) {
          this.userProfile = data as UserProfile;
          this.getTnaProjects('pageInit', this.queryParams['searchTerm'],
            this.queryParams['page'] || this.defaultPageNumber,
            this.queryParams['size'] || this.defaultPageSize, true, this.queryParams['sortTerm'],
            this.queryParams['sortDirection']);
        }
      },
      error: (err) => {
        this.router.navigate([err.status]);
      }
    });

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.queryParams = {...params};
      this.currentSearchTerm = params['searchTerm'];
    });

    if (this.queryParams['sortTerm'] && this.queryParams['sortDirection']){
      this.sortTerm = this.queryParams['sortTerm'];
      this.sortDirection = this.queryParams['sortDirection'];
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTnaProjects(
    pageEvent: string, searchTerm: string, pageNumber: number, pageSize: number, pagination: boolean, sortTerm: string,
    sortDirection: string) {
    // default sorting
    if (!sortTerm){
      sortTerm = "id";
      sortDirection = "desc";
    }

    this.apiService.getTnaProjects(searchTerm, pageNumber, pageSize, true, sortTerm, sortDirection).subscribe(
      {
        next: (data) => {
          console.log(data);
          this.projectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: entry['id'],
            title: entry['project_title'],
            pi: entry['principal_investigator']['first_name'] + " " + entry['principal_investigator']['last_name'],
            participants:  entry['additional_participants'].map((obj: { first_name: any; last_name: any; }) =>
              `${obj?.first_name} ${obj?.last_name}`).join(', '),
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
          this.router.navigate([err.status]);
        },
        complete: () => {
          if (pageEvent === 'pageInit'){
            if (this.queryParams['page']){
              this.resetPagination(this.queryParams['page']);
            }
            if (this.queryParams['sortTerm'] && this.sort){
              this.sort.active = this.getFrontendTerm(this.queryParams['sortTerm']);
              this.sort.direction = this.queryParams['sortDirection'] || 'asc';
              this.sort.sortChange.emit(this.sort);
            }
          }
        }
      });
  }

  searchChanged(event: any) {
    // reset query params before applying filter
    this.paginator.pageIndex = 0;

    const searchFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.applySearchFilter.bind(this), 500, searchFilterValue);
  }

  applySearchFilter(searchTerm: string) {
    this.getTnaProjects('searchEvent', searchTerm, 1, this.paginator.pageSize, true,
      this.queryParams['sortTerm'],
      this.queryParams['sortDirection']);
    this.updateUrlParameters(searchTerm, 'searchTerm');
    this.updateUrlParameters('', 'page');
  }

  customSort(event: any) {
    this.sortTerm = this.getApiTerm(event.active);
    this.sortDirection = event.direction;
    if ('sortables' in event){
      // on page init, event is a MatSort object
      this.getTnaProjects('sortEvent', this.currentSearchTerm, this.queryParams['page'],
        this.paginator.pageSize, true, this.sortTerm, this.sortDirection);
    } else{
      // start from the first page and remove page param from url
      this.getTnaProjects('sortEvent', this.currentSearchTerm, 1, this.paginator.pageSize,
        true, this.sortTerm, this.sortDirection);
      this.paginator.pageIndex = 0;
      this.updateUrlParameters('', 'page');
      // update url params with new sorting values
      this.updateUrlParameters(this.sortTerm, 'sortTerm');
      this.updateUrlParameters(this.sortDirection, 'sortDirection');
    }
  }

  getApiTerm(term: string) {
    const apiTerms: { [index: string]: any } = {
      title: 'project_title',
      connected: 'associated_application',
      status: 'record_status'
    }
    return apiTerms[term];
  }

  getFrontendTerm(term: string) {
    const frontendTerms: { [index: string]: any } = {
      project_title: 'title',
      associated_application: 'connected',
      record_status: 'status'
    }
    return frontendTerms[term];
  }

  onPageChange(event: any) {
    const currentPage = +event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.getTnaProjects(
      'paginationEvent', this.currentSearchTerm, currentPage, pageSize, true, this.sortTerm,
      this.sortDirection)
    this.updateUrlParameters(currentPage.toString(), 'page');
    this.updateUrlParameters(pageSize.toString(), 'size');
  }

  updateUrlParameters(value: string, parameterName: string) {
    if (value) {
      this.queryParams[parameterName] = value;
    } else {
      if (parameterName in this.queryParams) {
        delete this.queryParams[parameterName];
      }
    }
    // will not reload the page, but will update query params
    this.router.navigate([],
      {
        relativeTo: this.activatedRoute,
        queryParams: this.queryParams,
        replaceUrl: true, skipLocationChange: false
      });
  }

  resetPagination(pageNumber: number) {
    pageNumber = pageNumber - 1
    if (pageNumber != 0 && this.paginator) {
      this.paginator.pageIndex = pageNumber;
    }
  }
}
