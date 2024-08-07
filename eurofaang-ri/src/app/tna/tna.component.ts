import {Component, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
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
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink, Params} from "@angular/router";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatRadioButton, MatRadioChange, MatRadioGroup} from "@angular/material/radio";
import {MatOption, MatSelect} from "@angular/material/select";
import {CommonModule} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {ApiService} from '../services/api.service';
import {researchInstallations} from './constants';
import {MatSnackBar} from "@angular/material/snack-bar";
import {countries} from '../shared/constants';
import { MatDialog } from '@angular/material/dialog';
import { TnaDialogComponent } from './tna-dialog/tna-dialog.component';
import {ParticipantDetailsComponent} from "./participant-details/participant-details.component";

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
    FormsModule,
    ParticipantDetailsComponent,
    AsyncPipe
  ],
  providers: [ApiService],
  templateUrl: './tna.component.html',
  styleUrl: './tna.component.css'
})
export class TnaComponent implements OnInit {
  tnaForm: FormGroup | undefined;
  firstPreferences: string[] = researchInstallations;
  secondPreferences: string[] = researchInstallations;
  thirdPreferences: string[] = researchInstallations;
  countriesList: string[] = [];
  tnaProjectsList: string[] = [];
  existingAddParticipantsList: string[] = [];
  userID: number = 0;
  userFullName: string = '';
  snackBarRef: any;
  tnaId: string = '';
  tnaProjectDetails: any;
  enableEdit: boolean = true;
  participant_action: {[index: string]:any}= {};
  pageMode: string = '';
  participantDetails: {[index: string]:any}= {}; // store selected participant details
  dataLoaded: Promise<boolean> | undefined;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private apiService: ApiService,
              public snackbar: MatSnackBar,
              public dialog: MatDialog) {

    const userData: string | null = sessionStorage.getItem('userData');

    if (userData) {
      const userDataObj = JSON.parse(userData);
      this.userID = parseInt(userDataObj['id']);
      this.userFullName = userDataObj['first_name'] + " " + userDataObj['last_name'];
    }

  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.tnaId = params['id'];
      this.initializeForm();
      this.loadTnaProjectDetails();
    });
  }

  initializeForm() {
    this.tnaForm = this.formBuilder.group({
      principalInvestigator: this.formBuilder.group({
        principalInvestigatorId: [this.userID],
      }),
      participants: this.formBuilder.group({
        participantFields: this.formBuilder.array(this.router.url.startsWith("/tna/edit") ? [] :
          [this.createParticipantFormGroup('existing')])
      }),
      projectInformation: this.formBuilder.group({
        applicationConnection: ['no'],
        associatedProjectTitle: [''],
        projectTitle: ['', Validators.required],

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

  loadTnaProjectDetails() {
    if (this.tnaId) {
      this.pageMode = 'edit';
      this.apiService.getTnaProjectDetails(this.tnaId).subscribe(
        {
          next: (data) => {
            this.tnaProjectDetails = data['data'];
            // build form object with fetched data
            const tnaFormObj: object = this.buildFormValueObj(this.tnaProjectDetails);
            this.tnaForm?.setValue(tnaFormObj);
            if (!this.enableEdit) {
              this.tnaForm?.disable()
            }
            this.dataLoaded = Promise.resolve(true);
          },
          error: (err: any) => {
            this.router.navigate([err.status]);
          },
          complete: () => {
          }
        }
      );
    } else {
      this.pageMode = 'new';
      this.participant_action[0] = 'existing';
      this.dataLoaded = Promise.resolve(true);
    }
    this.countriesList = countries;
    this.getTnaProjects();
    this.getExistingParticipants();
  }

  buildFormValueObj(tnaProjectDetails: any) {
    this.enableEdit = parseInt(tnaProjectDetails['tna_owner']) === this.userID
      && tnaProjectDetails['record_status'] != 'submitted';
    const participantFields = [];
    const participantsFormArray = this.tnaForm?.get('participants.participantFields') as FormArray;

    for (let [index, obj] of tnaProjectDetails['additional_participants'].entries()) {
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
      this.participant_action[index] = 'editMode';
    }

    const formObject: { [key: string]: { [key: string]: any } } = {
      'principalInvestigator': {'principalInvestigatorId': tnaProjectDetails['principal_investigator']['id']},
      'participants': {
        'participantFields': []
      },
      'projectInformation': {
        'applicationConnection': tnaProjectDetails['associated_application'],
        'associatedProjectTitle': tnaProjectDetails['associated_application_title'] ?
          tnaProjectDetails['associated_application_title']['id'] : '',
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
    return formObject;
  }


  enableValidation(tnaForm: any) {
    function setFieldValidation(formControl: string) {
      tnaForm.get(formControl).setValidators([Validators.required]);
      tnaForm.get(formControl).updateValueAndValidity();
    }
    function setFormArrayValidation(formControl: string, fieldName: string, index: number) {
      tnaForm.get(formControl).at(index).controls[fieldName].setValidators([Validators.required])
      tnaForm.get(formControl).at(index).controls[fieldName].updateValueAndValidity();
    }
    function setFormArrayOrganisationValidation(fieldName: string, index: number) {
      tnaForm.get('participants.participantFields').at(index).controls['organisation'].controls[fieldName].setValidators([Validators.required])
      tnaForm.get('participants.participantFields').at(index).controls['organisation'].controls[fieldName].updateValueAndValidity();
    }

    setFieldValidation('projectInformation.projectTitle');
    if (tnaForm.get('projectInformation.applicationConnection').value === 'yes') {
      setFieldValidation('projectInformation.associatedProjectTitle');
    }
    setFieldValidation('projectInformation.preferredResearchInstallation.preference1');
    setFieldValidation('projectInformation.preferredResearchInstallation.preference2');
    setFieldValidation('projectInformation.preferredResearchInstallation.preference3');
    setFieldValidation('projectInformation.rationale.context');
    setFieldValidation('projectInformation.rationale.objective');
    setFieldValidation('projectInformation.rationale.impact');
    setFieldValidation('projectInformation.scientificQuality.stateArt');
    setFieldValidation('projectInformation.scientificQuality.questionHypothesis');
    setFieldValidation('projectInformation.scientificQuality.approach');
    setFieldValidation('projectInformation.valorizationStrategy.strategy');

    // participants validation
    tnaForm.get('participants.participantFields').controls.forEach((control: any, i: number) => {
        if ('existingParticipants' in control.controls) {
          setFormArrayValidation('participants.participantFields', 'existingParticipants', i)
        } else {
          setFormArrayValidation('participants.participantFields', 'phone', i)
          setFormArrayValidation('participants.participantFields', 'email', i)
          setFormArrayOrganisationValidation('organisationName', i);
          setFormArrayOrganisationValidation('organisationAddress', i);
          setFormArrayOrganisationValidation('organisationCountry', i);
        }
      }
    );
  }

  disableValidation(tnaForm: any) {
    function removeFieldValidation(formControl: string) {
      tnaForm.get(formControl).removeValidators([Validators.required]);
      tnaForm.get(formControl).updateValueAndValidity();
    }
    function removeFormArrayValidation(formControl: string, fieldName: string, index: number) {
      tnaForm.get(formControl).at(index).controls[fieldName].removeValidators([Validators.required]);
      tnaForm.get(formControl).at(index).controls[fieldName].updateValueAndValidity();
    }
    function removeFormArrayOrganisationValidation(fieldName: string, index: number) {
      tnaForm.get('participants.participantFields').at(index).controls['organisation'].controls[fieldName].removeValidators([Validators.required]);
      tnaForm.get('participants.participantFields').at(index).controls['organisation'].controls[fieldName].updateValueAndValidity();
    }

    // removeFieldValidation('projectInformation.projectTitle');
    if (tnaForm.get('projectInformation.applicationConnection').value === 'yes') {
      removeFieldValidation('projectInformation.associatedProjectTitle');
    }
    removeFieldValidation('projectInformation.preferredResearchInstallation.preference1');
    removeFieldValidation('projectInformation.preferredResearchInstallation.preference2');
    removeFieldValidation('projectInformation.preferredResearchInstallation.preference3');
    removeFieldValidation('projectInformation.rationale.context');
    removeFieldValidation('projectInformation.rationale.objective');
    removeFieldValidation('projectInformation.rationale.impact');
    removeFieldValidation('projectInformation.scientificQuality.stateArt');
    removeFieldValidation('projectInformation.scientificQuality.questionHypothesis');
    removeFieldValidation('projectInformation.scientificQuality.approach');
    removeFieldValidation('projectInformation.valorizationStrategy.strategy');

    // participants validation
    tnaForm.get('participants.participantFields').controls.forEach((control: any, i: number) => {
        if ('existingParticipants' in control.controls) {
          removeFormArrayValidation('participants.participantFields', 'existingParticipants', i)
        } else {
          removeFormArrayValidation('participants.participantFields', 'phone', i)
          removeFormArrayValidation('participants.participantFields', 'email', i)
          removeFormArrayOrganisationValidation('organisationName', i);
          removeFormArrayOrganisationValidation('organisationAddress', i);
          removeFormArrayOrganisationValidation('organisationCountry', i);
        }
      }
    );
  }

  onSubmit(tnaId: any, action: any): void {
    if (action == 'submitted') {
      this.enableValidation(this.tnaForm);
    } else {
      this.disableValidation(this.tnaForm);
    }

    if (this.tnaForm?.invalid) {
      console.log(this.tnaForm?.errors);
    } else {
      let formValues = this.tnaForm?.getRawValue();
      formValues['recordStatus'] = action;

      if (tnaId) {
          this.apiService.editTnaProject(formValues, tnaId).subscribe({
          next: (data) => {
            this.openSnackbar(`TNA project successfully ${action}`, 'Dismiss');
            this.router.navigate([`/tna/view/${tnaId}`]);
          },
          error: (error) => {
            this.openSnackbar('Submission Failed! Contact FAANG helpdesk', 'Dismiss');
          },
            complete: () => {
            }
        });
      } else {
        this.apiService.createTnaProject(formValues).subscribe(
          {
            next: (data) => {
              this.openSnackbar('TNA project successfully created', 'Dismiss');
              this.router.navigate([`/user-profile/${this.userID}`]);
            },
            error: (error) => {
              this.openSnackbar('Submission Failed! Contact FAANG helpdesk', 'Dismiss');
            },
            complete: () => {
            }
          });
      }
    }
  }

  public addFilterFormGroup() {
    const participants = this.tnaForm?.get('participants.participantFields') as FormArray;
    participants.push(this.createParticipantFormGroup('existing'));
    const formControlsLength = Object.keys(this.participant_action).length;
    this.participant_action[formControlsLength] = 'existing';
  }

  public removeFilter(i: number) {
    const participants = this.tnaForm?.get('participants.participantFields') as FormArray;
    if (participants.length > 0) {
      participants.removeAt(i);
    } else {
      participants.reset();
    }
    // we need to update keys of the object to be continuous
    this.resetParticipantActionObj(i)
  }


  resetParticipantActionObj(index: number){
    delete this.participant_action[index];
    // update keys to be numeric and continuous
    let count = 0;
    const newObj: {[index: number]:any} = {}
    for (const property in this.participant_action) {
      newObj[count] = this.participant_action[property];
      count++;
    }
    this.participant_action = Object.assign({}, newObj);
  }

  private createParticipantFormGroup(action: string): FormGroup {
    if (action === 'existing') {
      return new FormGroup({
        existingParticipants: new FormControl(''),
      });
    } else {
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
  }

  private editParticipantFormGroup(participantObj: { [key: string]: any }): FormGroup {
    return new FormGroup({
      id: new FormControl({value: participantObj['id'], disabled: true}),
      firstname: new FormControl({value: participantObj['firstname'], disabled: true}, Validators.required),
      lastname: new FormControl({value: participantObj['lastname'], disabled: true}, Validators.required),
      phone: new FormControl({value: participantObj['phone'], disabled: true}, [Validators.pattern("^[0-9]*$")]),
      email: new FormControl({value: participantObj['email'], disabled: true}, [Validators.email]),
      organisation: new FormGroup({
        organisationName: new FormControl({value: participantObj['organisation']['organisationName'], disabled: true}),
        organisationAddress: new FormControl({
          value: participantObj['organisation']['organisationAddress'],
          disabled: true
        }),
        organisationCountry: new FormControl({
          value: participantObj['organisation']['organisationCountry'],
          disabled: true
        }),
      }),
    });
  }

  getFormControls() {
    return (this.tnaForm?.get('participants.participantFields') as FormArray).controls;
  }

  enabledMode(control: any): boolean {
    return !('id' in control['value']);
  }

  getExistingParticipants(): void {
    this.apiService.getUsers('', 0, 10, false, 'last_name', 'asc').subscribe(
      {
        next: (data) => {
          this.existingAddParticipantsList = data['data'].filter(
            (entry: { [x: string]: any; }) => entry['id'] !== this.userID
          ).map((entry: { [x: string]: any; }) => ({
            id: Number(entry['id']),
            name: `${entry['first_name']} ${entry['last_name']}`
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

  getTnaProjects(): void {
    this.apiService.getTnaProjects(
      '', 0, 10, false, 'project_title', 'asc'
    ).subscribe(
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

  getId(obj: any) {
    return obj['id'] ? obj['id'] : 0;
  }

  getProjectTitle(project: any) {
    return project['title'] ? project['title'] : '**missing title**';
  }

  getUserFullName(user: any) {
    return user['name'] ? user['name'] : '**missing name**';
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

  openDialog(action: string): void {
    // no need to display modal box if project is already submitted
    if (action === 'cancel' && !this.enableEdit){
      this.router.navigate([`user-profile/${this.userID}`], {queryParams: {}, replaceUrl: true, skipLocationChange: false});
      return;
    }
    const dialogRef = this.dialog.open(TnaDialogComponent, {
      height: '300px', width: '400px',
      data: {tnaId: this.tnaId, action: action},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'save'){
        this.onSubmit(this.tnaId, 'saved')
      } else if (result === 'submit'){
        this.onSubmit(this.tnaId, 'submitted')
      } else if (result === 'cancel'){
        this.router.navigate([`user-profile/${this.userID}`], {queryParams: {}, replaceUrl: true, skipLocationChange: false});
      }
    });
  }

  radioChange(event: MatRadioChange, index: number): void {
    const participants = this.tnaForm?.get('participants.participantFields') as FormArray;
    participants.controls[index] = this.createParticipantFormGroup(event.value);
    this.participant_action[index] = event.value;
    delete this.participantDetails[index];
  }

  associatedProjChange(event: MatRadioChange): void {
    this.tnaForm?.get('projectInformation.associatedProjectTitle')?.setValue('');
  }

  getParticipantDetails(event: any, index: number){
    this.apiService.getUserDetails(event.value).subscribe(
      {
        next: (data) => {
          this.participantDetails[index] = data['data'];
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
