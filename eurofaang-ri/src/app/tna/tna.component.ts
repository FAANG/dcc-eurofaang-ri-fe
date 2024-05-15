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
import {ActivatedRoute, Router, RouterLink, Params} from "@angular/router";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatOption, MatSelect} from "@angular/material/select";
import {CommonModule} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {ApiService} from '../services/api.service';
import {researchInstallations} from './constants';
import {MatSnackBar} from "@angular/material/snack-bar";
import { countries } from '../shared/constants';

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
  userID: number = 0;
  userFullName: string = '';
  snackBarRef: any;
  tnaId: string = '';
  tnaOwner: string = '';
  tnaProjectDetails: any;
  enableEdit: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiService,
              public snackbar: MatSnackBar,) {

    // get loggedIn user details
    const userData: string | null = sessionStorage.getItem('userData');

    if (userData) {
      console.log(userData)
      const userDataObj = JSON.parse(userData);
      this.userID = parseInt(userDataObj['id']);
      this.userFullName = userDataObj['first_name'] + " " + userDataObj['last_name'];
    }

    this.tnaForm = this.formBuilder.group({
      principalInvestigator: this.formBuilder.group({
        principalInvestigatorId: [this.userID],
      }),
      participants: this.formBuilder.group({
        participantFields: this.formBuilder.array(this.router.url.startsWith("/tna/edit") ? [] : [this.createParticipantFormGroup()])
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
    this.route.params.subscribe((params: Params) => {
      this.tnaId = params['id'];
    });

    if (this.tnaId) {
      this.apiService.getTnaProjectDetails(this.tnaId).subscribe(
        {
          next: (data) => {
            console.log(data)
            if (!("data" in data)) {
              this.router.navigate(['404']);
            } else {
              this.tnaProjectDetails = data['data'];
              // build form object with fetched data
              const tnaFormObj: object = this.buildFormValueObj(this.tnaProjectDetails);
              this.tnaForm.setValue(tnaFormObj);
              if (!this.enableEdit) {
                this.tnaForm.disable()
              }

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
    this.countriesList = countries;
    this.getTnaProjects();
  }

  buildFormValueObj(tnaProjectDetails: any) {
    if (parseInt(tnaProjectDetails['tna_owner']) ===  this.userID){
      this.enableEdit = true;
    }
    const participantFields = [];
    const participantsFormArray = this.tnaForm.get('participants.participantFields') as FormArray;
    for (let obj of tnaProjectDetails['additional_participants']) {
      const participantObj = {
        'id': obj['id'] ? obj['id'] : null,
        'firstname': obj['first_name'],
        'lastname': obj['last_name'],
        'phone': obj['phone_number'],
        'email': obj['email'],
        'organisation': {
          'organisationName': obj['organization_name'],
          'organisationAddress': obj['organization_address'],
          'organisationCountry': obj['organization_country'],
        }
      }
      participantFields.push(participantObj);
      participantsFormArray.push(this.editParticipantFormGroup(participantObj));
    }

    const formObject: { [key: string]: { [key: string]: any } } = {
      'principalInvestigator': {'principalInvestigatorId': tnaProjectDetails['principal_investigator']['id']},
      'participants': {
        'participantFields': []
      },
      'projectInformation': {
        'applicationConnection': tnaProjectDetails['associated_application'],
        'associatedProjectTitle': tnaProjectDetails['associated_application_title'],
        'projectTitle': tnaProjectDetails['project_title'],
        'preferredResearchInstallation': {
          'preference1': tnaProjectDetails['research_installation_1'],
          'preference2': tnaProjectDetails['research_installation_2'],
          'preference3': tnaProjectDetails['research_installation_3'],
        },
        'rationale': {
          'context': tnaProjectDetails['context'],
          'objective': tnaProjectDetails['objective'],
          'impact': tnaProjectDetails['impact'],
        },
        'scientificQuality': {
          'stateArt': tnaProjectDetails['state_art'],
          'questionHypothesis': tnaProjectDetails['scientific_question_hypothesis'],
          'approach': tnaProjectDetails['approach'],
        },
        'valorizationStrategy': {
          'strategy': tnaProjectDetails['strategy'],
        }
      }
    }
    formObject['participants']['participantFields'] = participantFields;
    console.log(participantFields)

    return formObject;

  }

  onSubmit(tnaId: any): void {
    if (this.tnaForm.invalid) {
      console.log(this.tnaForm.errors);
    } else {
      console.log(this.tnaForm.value)
      console.log(this.tnaForm.getRawValue())

      if (tnaId){
        this.apiService.editTnaProject(this.tnaForm.getRawValue(), tnaId).subscribe(
          data => {
            console.log(data)
            this.openSnackbar('TNA project successfully created', 'Dismiss');
            this.router.navigate([`/user-profile/${this.userID}`]);
          },
          error => {
            console.log("Submission Failed!");
            this.openSnackbar('Submission Failed! Contact FAANG helpdesk', 'Dismiss');
          }
        );
      } else {
        this.apiService.createTnaProject(this.tnaForm.getRawValue()).subscribe(
          data => {
            console.log(data)
            this.openSnackbar('TNA project successfully created', 'Dismiss');
            this.router.navigate([`/user-profile/${this.userID}`]);
          },
          error => {
            console.log("Submission Failed!");
            this.openSnackbar('Submission Failed! Contact FAANG helpdesk', 'Dismiss');
          }
        );
      }
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

  private createParticipantFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl({value: null, disabled: true}),
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

  private editParticipantFormGroup(participantObj : { [key: string]: any }): FormGroup {
    return new FormGroup({
      id: new FormControl({value: participantObj['id'], disabled: true}),
      firstname: new FormControl({value: participantObj['firstname'], disabled: true}, Validators.required),
      lastname: new FormControl({value: participantObj['lastname'], disabled: true}, Validators.required),
      phone: new FormControl({value: participantObj['phone'], disabled: true}, [Validators.pattern("^[0-9]*$")]),
      email: new FormControl({value: participantObj['email'], disabled: true}, [Validators.email]),
      organisation: new FormGroup({
        organisationName: new FormControl({value: participantObj['organisation']['organisationName'], disabled: true}),
        organisationAddress: new FormControl({value: participantObj['organisation']['organisationAddress'], disabled: true}),
        organisationCountry: new FormControl({value: participantObj['organisation']['organisationCountry'], disabled: true}),
      }),
    });
  }

  getFormControls() {
    return (this.tnaForm.get('participants.participantFields') as FormArray).controls;
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
      this.router.navigate([`/user-profile/${this.userID}`]);
    });
  }


}
