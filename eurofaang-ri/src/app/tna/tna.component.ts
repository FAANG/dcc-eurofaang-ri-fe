import {Component, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatList, MatListItem} from "@angular/material/list";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {NgForOf, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatOption, MatSelect} from "@angular/material/select";
import {CommonModule} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {ParticipantFormComponent} from "./participant-form/participant-form.component";
import {ApiService} from '../services/api.service';
import {researchInstallations} from './constants';

@Component({
  selector: 'app-tna',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatList,
    MatListItem,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    NgIf,
    RouterLink,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatRadioGroup,
    MatRadioButton,
    MatSelect,
    MatOption,
    NgForOf,
    CommonModule,
    MatIcon,
    ParticipantFormComponent
  ],
  providers: [ApiService],
  templateUrl: './tna.component.html',
  styleUrl: './tna.component.css'
})
export class TnaComponent implements OnInit {
  tnaForm: FormGroup;
  firstPreferences: string[] = researchInstallations;
  secondPreferences: string[] = researchInstallations;
  thirdPreferences: string[] = researchInstallations;
  countriesList: string[] = [];

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private apiService: ApiService,) {
    this.tnaForm = this.formBuilder.group({
      firstname: [''],
      lastname: [''],
      phone: ['', Validators.pattern("^[0-9]*$")],
      email: ['', Validators.email],
      organisation: this.formBuilder.group({
        organisationName: [''],
        organisationAddress: [''],
        organisationCountry: [''],
      }),
      participants: this.formBuilder.group({
        participantFields: this.formBuilder.array([this.createParticipantFormGroup()])
      }),
      projectInformation: this.formBuilder.group({
        applicationConnection: [''],
        associatedPrincipalInvestigator: [''],
        associatedProjectTitle: [''],
        projectTitle: [''],

        preferredResearchInstallation: this.formBuilder.group({
          preference1: [''],
          preference2: [''],
          preference3: [''],
        }),

        rationale: this.formBuilder.group({
          context: [''],
          objective: [''],
          impact: [''],
        }),
        scientificQuality: this.formBuilder.group({
          stateArt: [''],
          questionHypothesis: [''],
          approach: [''],
        }),
        valorizationStrategy: this.formBuilder.group({
          strategy: [''],
        }),
      }),
    });
  }

  ngOnInit() {
    this.getCountries();
  }

  onSubmit(): void {
    if (this.tnaForm.invalid) {
      console.log(this.tnaForm.errors);
    } else {
      console.log(this.tnaForm)
    }
  }

  public addFilterFormGroup() {
    const participants = this.tnaForm.get('participants.participantFields') as FormArray;
    participants.push(this.createParticipantFormGroup());
  }

  public removeFilter(i: number) {
    const participants = this.tnaForm.get('participants.participantFields') as FormArray;
    if (participants.length > 1) {
      participants.removeAt(i);
    } else {
      participants.reset();
    }
  }

  getFormValues() {
    if (this.tnaForm.valid) {
      return this.tnaForm.value;
    }
    return null;
  }

  private createParticipantFormGroup(): FormGroup {
    return new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      phone: new FormControl('', [Validators.pattern("^[0-9]*$")]),
      email: new FormControl('', [Validators.email]),
      organisation: new FormGroup({
        organisationName: new FormControl(''),
        organisationAddress: new FormControl(''),
        organisationCountry: new FormControl(''),
      }),

    });
  }

  getFormControls() {
    return (this.tnaForm.get('participants.participantFields') as FormArray).controls;
  }

  getCountries() {
    console.log('aaa')
    this.apiService.getCountries().subscribe(
      {
        next: (data) => {
          this.countriesList = data['properties']['geographic_location']['properties']['value']['enum']
            .filter((country: string) => country !== 'restricted access');
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
