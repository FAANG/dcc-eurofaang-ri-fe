import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {UserCredentials} from "../auth";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  loginForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  logInUser(user: UserCredentials): void {
    this.authService.logIn(user.username, user.password).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onSubmit(formData: UserCredentials): void {
    if (this.loginForm.invalid) {
      console.log(this.loginForm.errors);
    } else {
      this.logInUser(formData);
    }
  }
}
