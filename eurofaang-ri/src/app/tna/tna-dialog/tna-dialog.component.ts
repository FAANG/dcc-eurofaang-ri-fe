import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent} from '@angular/material/dialog';
import {MatButton, MatButtonModule} from '@angular/material/button';
import { TitleCasePipe } from '@angular/common';

export interface DialogData {
  tnaId: string;
  action: string;
}

@Component({
  selector: 'app-tna-dialog',
  standalone: true,
  imports: [MatButtonModule, MatButton, MatDialogContent, TitleCasePipe],
  templateUrl: './tna-dialog.component.html',
  styleUrl: './tna-dialog.component.css'
})
export class TnaDialogComponent {
  inputData: any;
  userAction: string;

  constructor(public dialogRef: MatDialogRef<TnaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.inputData = {...data};
    this.userAction = this.inputData['action'];
  }

  onCancelDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.inputData['action']);
  }

  displayTitle(action: string){
    if (action === 'save'){
      return "Saving TNA project details";
    }else if (action === 'submit'){
      return "Submitting TNA project details";
    }else if (action === 'cancel'){
      return "Cancel";
    }else{
      return null;
    }

    return action === 'save' ? 'Saving TNA project details' : 'Submitting TNA project details';
  }

  displayContent(action: string){
    if (action === 'save'){
      return "Clicking the <b>Save</b> button will save the form details to our database, allowing you to edit the " +
        "TNA project information in the future.";
    }else if (action === 'submit'){
      return "Clicking the <b>Submit</b> button will submit the form details to our database. This action will lock " +
        "the project, preventing any further changes, and you will only be able to view it.";
    }else if (action === 'cancel'){
      return "Clicking the <b>Cancel</b> button will discard any changes you have made to the form and return " +
        "you to the main page.";
    }else{
      return null;
    }
  }

}
