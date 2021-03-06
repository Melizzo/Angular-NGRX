import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AuthResponseData, AuthService } from "./auth.service";
import * as fromApp from '../store/app.reducer'
import * as AuthActions from './store/auth.actions'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})

export class AuthComponent {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private store: Store<fromApp.AppState>
  ){}

  isLoginMode = true;
  isLoading = false;
  error: string = null;

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email
    const password = form.value.password
    let authObs: Observable<AuthResponseData>;
    
    this.isLoading = true;

    if(this.isLoginMode) {
      // authObs = this.authService.login(email, password)
        this.store.dispatch(new AuthActions.LoginStart({
          email: email,
          password: password
        })
      )
    } else {
      authObs = this.authService.signUp(email, password)
    }
    
    authObs.subscribe(responseData => {
      console.log(responseData);
      this.isLoading = false;
      this.router.navigate(['/recipes'])
    }, 
    errorMessage => {
      this.error = errorMessage;
      this.isLoading = false;
    })
    form.reset();
  }

  onHandleError() {
    this.error = null;
  }

}