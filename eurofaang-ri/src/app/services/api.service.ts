import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpBackend, HttpHeaders} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {URL} from "../auth";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions :{headers: HttpHeaders} = {
    headers: new HttpHeaders({
    })
  };

  constructor(private http: HttpClient,
              handler: HttpBackend) {
    // service is not intercepted by AuthInterceptor.
    this.http = new HttpClient(handler);

    // set authorisation token
    const userData: string | null = sessionStorage.getItem('userData');
    let token = '';
    if (userData) {
      token = JSON.parse(userData)['token'];
    }
    this.httpOptions = {
      headers: new HttpHeaders({
        "Authorization": "Token " + token
      })
    };
  }

  getTnaProjects(searchTerm: string, pageNumber: number, pagination: boolean, sortTerm: string, sortDirection: string) {
    let url = `${URL}/api/v1/tna/`;
    // defines whether the data will be paginated on the backend
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
    console.log(sortTerm)
    console.log(sortDirection)
    if (sortTerm){
      const direction: '-'|'' = sortDirection === 'desc' ? '-' : '';
      const pageParam = url.includes('?') ? `&ordering=${direction}${sortTerm}` : `?ordering=${direction}${sortTerm}`
      url = url + pageParam;
    }
    console.log(url)

  // http://localhost:8000/api/v1/tna/?ordering=-project_title
    // TODO: work on ordering

    let res: { [key: string]: any } = {}
    return this.http.get(url, this.httpOptions).pipe(
      map((data: any) => {
        console.log(data)
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

  getUserDetails(userId: number) {
    const url = `${URL}/api/v1/users/${userId}/`;
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
    const url = URL + '/api/v1/tna/';
    return this.http.post(url, body, this.httpOptions).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }

  editTnaProject(body: any, tnaId: any) {
    console.log(body)
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

}
