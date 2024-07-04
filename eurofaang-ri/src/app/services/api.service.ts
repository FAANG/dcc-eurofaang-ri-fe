import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {URL} from "../auth";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions :{headers: HttpHeaders} = {
    headers: new HttpHeaders({
    })
  };

  constructor(private http: HttpClient, private router: Router) {}

  private getUpdatedUrl(
    url: string, searchTerm: string, pageNumber: number, pageSize: number, pagination: boolean, sortTerm: string,
    sortDirection: string
  ) {
    const paginationParam = url.includes('?') ? `&pagination=${pagination}` : `?pagination=${pagination}`
    url = url + paginationParam;

    if (searchTerm){
      const searchParam = url.includes('?') ? `&search=${searchTerm}` : `?search=${searchTerm}`
      url = url + searchParam;
    }
    if (pageNumber){
      const pageParam = url.includes('?') ? `&page=${pageNumber}` : `?page=${pageNumber}`
      url = url + pageParam;
    }
    if (pageSize) {
      const pageSizeParam = url.includes('?') ? `&size=${pageSize}` : `?size=${pageSize}`;
      url = url + pageSizeParam;
    }
    if (sortTerm){
      const direction: '-'|'' = sortDirection === 'desc' ? '-' : '';
      const pageParam = url.includes('?') ? `&ordering=${direction}${sortTerm}` : `?ordering=${direction}${sortTerm}`
      url = url + pageParam;
    }
    return url;
  }

  getTnaProjects(
    searchTerm: string, pageNumber: number, pageSize: number, pagination: boolean, sortTerm: string, sortDirection: string
  ) {
    let url = `${URL}/api/v1/tna/`;
    // defines whether the data will be paginated on the backend
    url = this.getUpdatedUrl(url, searchTerm, pageNumber, pageSize, pagination, sortTerm, sortDirection);
    let res: { [key: string]: any } = {}
    return this.http.get(url, this.httpOptions).pipe(
      map((data: any) => {
        if ('results' in data) {
          res['data'] = data['results'];
          res['count'] = data['count'];
        } else{
          res['data'] = data;
        }
        return res;
      }),
      catchError(this.handleError),
    );
  }

  getTnaProjectDetails(tnaId: string) {
    const url = `${URL}/api/v1/tna/${tnaId}/`;
    const res: { [key: string]: any } = {}
    return this.http.get(url, this.httpOptions).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }


  getUsers(searchTerm: string, pageNumber: number, pageSize: number, pagination: boolean, sortTerm: string,
           sortDirection: string) {
    let url = `${URL}/api/v1/users/`;
    // defines whether the data will be paginated on the backend
    url = this.getUpdatedUrl(url, searchTerm, pageNumber, pageSize, pagination, sortTerm, sortDirection);
    let res: { [key: string]: any } = {}
    return this.http.get(url, this.httpOptions).pipe(
      map((data: any) => {
        if ('results' in data) {
          res['data'] = data['results'];
          res['count'] = data['count'];
        } else{
          res['data'] = data;
        }
        return res;
      }),
      catchError(this.handleError),
    );
  }


  getUserDetails(userId: number) {
    const url = `${URL}/api/v1/users/${userId}/details/`;
    const res: { [key: string]: any } = {}
    return this.http.get(url).pipe(
      map((data: any) => {
        res['data'] = data;
        return res;
      }),
      catchError(this.handleError),
    );
  }

  createTnaProject(body: any) {
    const url = `${URL}/api/v1/tna/`;
    return this.http.post(url, body, this.httpOptions).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }

  editTnaProject(body: any, tnaId: any) {
    const url = `${URL}/api/v1/tna/${tnaId}/`;
    return this.http.put(url, body, this.httpOptions).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof HttpErrorResponse) {
      console.error('An errorSubject occurred:', error.error.message);
    } else {
      console.error(error);
    }
    return throwError(() => error);
  }

  logOut() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('userData');
    }
    this.router.navigate(['login']);
  }

  isLoggedIn(): boolean {
    if (typeof sessionStorage !== 'undefined') {
      return !!sessionStorage.getItem('userData');
    }
    return false;
  }

}
