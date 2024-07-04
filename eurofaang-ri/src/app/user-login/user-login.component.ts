import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {UserCredentials} from "../auth";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {Router} from "@angular/router";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  logInForm: FormGroup;
  formSubmitted = false;
  public error = '';
  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.logInForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  logInUser(user: UserCredentials): void {
    this.authService.logIn(user.username, user.password).subscribe({
      next: (data) => {
        this.formSubmitted = true;
        this.authService.setLoggedInUser(data);
        this.router.navigateByUrl(`/user-profile/${data.id}`);
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  onSubmit(): void {
    if (this.logInForm.invalid) {
      console.log(this.logInForm.errors);
    } else {
      this.logInUser(this.logInForm.value);
    }
  }
}
