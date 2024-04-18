import {Component, Input} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-participant-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatButton,
    MatInput,
    NgIf
  ],
  templateUrl: './participant-form.component.html',
  styleUrl: './participant-form.component.css'
})
export class ParticipantFormComponent {
  @Input() tnaForm: any;

  getFormControls() {
    return (this.tnaForm.get('participants.participantFields') as FormArray).controls;
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
    if (this.tnaForm.valid ) {
      return this.tnaForm.value;
    }
    return null;
  }

  private createParticipantFormGroup(): FormGroup {
    return new FormGroup({
      firstname: new FormControl('aaa'),
      lastname: new FormControl('bbb'),
      phone: new FormControl('',[Validators.pattern("^[0-9]*$")]),
      email: new FormControl('',[Validators.email]),
      organisation: new FormGroup({
        organisationName: new FormControl('ebi'),
        organisationAddress: new FormControl(''),
        organisationCountry: new FormControl(''),
      }),

    });
  }

}
