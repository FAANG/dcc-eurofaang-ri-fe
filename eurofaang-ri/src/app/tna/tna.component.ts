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
import {AuthService} from "../auth.service";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatOption, MatSelect} from "@angular/material/select";


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
  ],


  templateUrl: './tna.component.html',
  styleUrl: './tna.component.css'
})
export class TnaComponent implements OnInit {
  newForm: FormGroup;
  firstPreferences: string[] = ['preference 1', 'preference 2', 'preference 3'];
  secondPreferences: string[] = ['preference 1', 'preference 2', 'preference 3'];
  thirdPreferences: string[] = ['preference 1', 'preference 2', 'preference 3'];

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.newForm = this.formBuilder.group({
      firstname: [''],
      lastname: [''],
      phone: ['', Validators.pattern("^[0-9]*$")],
      email: ['', Validators.email],
      organisation: this.formBuilder.group({
        organisationName: [''],
        organisationAddress: [''],
        organisationCountry: [''],
      }),
      projectInformation: this.formBuilder.group({
        applicationConnection: [''],
        associatedPrincipalInvestigator: [''],
        associatedProjectTitle: [''],
        projectTitle: [''],
        // preferredResearchInstallation: [''],

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

  }

  onSubmit(): void {
    if (this.newForm.invalid) {
      console.log(this.newForm.errors);
    } else {
      // @ts-ignore
      this.newForm(this.newForm.value);
    }
  }
}
