import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
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
    MatDivider
  ],
  templateUrl: './tna-view.component.html',
  styleUrl: './tna-view.component.css',
  providers: [ApiService],
})
export class TnaViewComponent implements OnInit {
  tnaId: string = '';
  tnaProjectDetails: any;
  userFullName: string = '';
  participants: [] = [];
  dataLoaded: boolean = false;

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
              this.userFullName = `${this.tnaProjectDetails['principal_investigator']['first_name']}
              ${this.tnaProjectDetails['principal_investigator']['last_name']}`
              if ('additional_participants' in this.tnaProjectDetails){
                this.participants = this.tnaProjectDetails['additional_participants']
              }
              this.dataLoaded = true;
            }
          },
          error: (err: any) => {
            this.router.navigate(['404']);
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

