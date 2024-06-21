import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-participant-details',
  standalone: true,
  imports: [],
  templateUrl: './participant-details.component.html',
  styleUrl: './participant-details.component.css'
})
export class ParticipantDetailsComponent {
  @Input() participantDetails!: any;

}
