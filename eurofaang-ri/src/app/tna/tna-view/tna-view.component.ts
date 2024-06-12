import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-tna-view',
  standalone: true,
  imports: [],
  templateUrl: './tna-view.component.html',
  styleUrl: './tna-view.component.css',
  providers: [ApiService],
})
export class TnaViewComponent implements OnInit {
  tnaId: string = '';
  tnaProjectDetails: any;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,) {

  }
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.tnaId = params['id'];
    });

    if (this.tnaId) {
      this.apiService.getTnaProjectDetails(this.tnaId).subscribe(
        {
          next: (data) => {
            if (!("data" in data)) {
              this.router.navigate(['404']);
            } else {
              this.tnaProjectDetails = data['data'];
              console.log(this.tnaProjectDetails)
            }
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
}

