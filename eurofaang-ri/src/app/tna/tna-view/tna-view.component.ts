import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterLink} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-tna-view',
  standalone: true,
  imports: [
    CdkTextareaAutosize,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatRadioButton,
    MatRadioGroup,
    MatSelect,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    MatDivider,
    RouterLink
  ],
  templateUrl: './tna-view.component.html',
  styleUrl: './tna-view.component.css',
  providers: [ApiService],
})
export class TnaViewComponent implements OnInit {
  tnaId: string = '';
  userID: number | null = 0;
  tnaProjectDetails: any;
  userFullName: string = '';
  participants: [] = [];
  enableEdit: boolean = true;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,) {

    const userData: string | null = sessionStorage.getItem('userData');
    if (userData) {
      const userDataObj = JSON.parse(userData);
      this.userID = parseInt(userDataObj['id']);
    }

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
              this.userFullName = `${this.tnaProjectDetails['principal_investigator']['first_name']}
              ${this.tnaProjectDetails['principal_investigator']['last_name']}`
              if ('additional_participants' in this.tnaProjectDetails){
                this.participants = this.tnaProjectDetails['additional_participants']
              }
              this.enableEdit = parseInt(this.tnaProjectDetails['tna_owner']) === this.userID
                && this.tnaProjectDetails['record_status'] != 'submitted';
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

  getAssociated(){
    if ('additional_participants' in this.tnaProjectDetails){
      this.participants = this.tnaProjectDetails['additional_participants']
    }

  }
}

