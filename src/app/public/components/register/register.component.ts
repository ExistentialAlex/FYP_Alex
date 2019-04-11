import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../common/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  detailsForm: FormGroup;

  constructor(public fb: FormBuilder, public auth: AuthService) {}

  ngOnInit() {
    // This is the structure of the form, allowing parameters and validation to be supplied.
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-z0-9]+)$'),
          Validators.minLength(6),
          Validators.maxLength(25),
          Validators.required
        ]
      ]
    });

    this.detailsForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]]
    });
  }

  /**
   * Gets the value from the email field in the register form.
   */
  get email() {
    return this.registerForm.get('email');
  }

  /**
   * Gets the value from the password field in the register form.
   */
  get password() {
    return this.registerForm.get('password');
  }

  /**
   * Gets the value from the first_name field in the details form.
   */
  get firstName() {
    return this.detailsForm.get('first_name');
  }

  /**
   * Gets the value from the last_name field in the details form.
   */
  get lastName() {
    return this.detailsForm.get('last_name');
  }

  /**
   * Calls the emailSignUp() function in the auth service.
   */
  signup() {
    return this.auth.emailSignUp(this.email.value, this.password.value);
  }

  /**
   * Sets the details for the user supplied in the details form.
   *
   * @param user - The user to set the details for.
   */
  setDetails(user) {
    return this.auth.updateUser(user, {
      first_name: this.firstName.value,
      last_name: this.lastName.value
    });
  }
}
