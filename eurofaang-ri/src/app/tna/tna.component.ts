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
import {ApiService} from '../services/api.service';
import {researchInstallations} from './constants';
import {MatSnackBar} from "@angular/material/snack-bar";

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
    MatIcon
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
  tnaProjectsList: string[] = [];
  userID : string = '';
  userFullName: string = '';
  snackBarRef: any;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private apiService: ApiService,
              public snackbar: MatSnackBar,) {

    // get loggedIn user details
    const userData: string | null = localStorage.getItem('userData');
    if (userData) {
      console.log(userData)
      const userDataObj = JSON.parse(userData);
      this.userID =  userDataObj['id'];
      this.userFullName = userDataObj['first_name'] + " " + userDataObj['last_name'];
    }

    this.tnaForm = this.formBuilder.group({
      principalInvestigator: this.formBuilder.group({
        principalInvestigatorId: [this.userID],
      }),
      participants: this.formBuilder.group({
        participantFields: this.formBuilder.array([this.createParticipantFormGroup()])
      }),
      projectInformation: this.formBuilder.group({
        applicationConnection: [''],
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
    this.getTnaProjects();
  }

  onSubmit(): void {
    if (this.tnaForm.invalid) {
      console.log(this.tnaForm.errors);
    } else {
      console.log(this.tnaForm.value)

      this.apiService.createTnaProject(this.tnaForm.value).subscribe(
        data => {
          console.log(data)
          this.openSnackbar('TNA project successfully created', 'Dismiss');
          this.router.navigate(['/user-profile/1']);
        },
        error => {
          console.log("Submission Failed!");
          this.openSnackbar('Submission Failed! Contact FAANG helpdesk', 'Dismiss');
        }
      );

    }
  }

  public addFilterFormGroup() {
    const participants = this.tnaForm.get('participants.participantFields') as FormArray;
    participants.push(this.createParticipantFormGroup());
  }

  public removeFilter(i: number) {
    const participants = this.tnaForm.get('participants.participantFields') as FormArray;
    if (participants.length > 0) {
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
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
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

  getTnaProjects() {
    this.apiService.getTnaProjects().subscribe(
      {
        next: (data) => {
          this.tnaProjectsList = data['data'].map((entry: { [x: string]: any; }) => ({
            id: Number(entry['id']),
            title: entry['project_title']
          }));
        },
        error: (err: any) => {
          console.log(err.message);
        },
        complete: () => {
        }
      }
    );
  }

  getProjectId(project: any) {
    return project['id'] ? project['id'] : 0;
  }

  getProjectTitle(project: any) {
    return project['title'] ? project['title'] : '**missing tile**';
  }

  openSnackbar(message: string, action: string) {
    this.snackBarRef = this.snackbar.open(message, action, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000
    });

    this.snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/user-profile/1']);
    });
  }




}
