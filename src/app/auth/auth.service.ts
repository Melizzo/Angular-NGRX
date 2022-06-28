import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { User } from "./user.model";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import * as fromApp from '../store/app.reducer'
import * as AuthActions from './store/auth.actions'

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  // user = new BehaviorSubject<User>(null);
  tokenExpirationTimer: any;

  constructor(private http: HttpClient, 
              private router: Router,
              private store: Store<fromApp.AppState>){}
  
  signUp(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,{
        email: email,
        password: password, 
        returnSecureToken: true
      }
    ).pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.email, 
          resData.localId, 
          resData.idToken, 
          +resData.expiresIn
          )
      })
      )
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey, 
      {
        email: email,
        password: password, 
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError), 
      tap(resData => {
        this.handleAuthentication(
          resData.email, 
          resData.localId, 
          resData.idToken, 
          +resData.expiresIn
        )
      })
    )
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if(!userData) {
      return;
    } 
    const loadedUser = new User(
      userData.email, 
      userData.id, 
      userData._token, 
      new Date(userData._tokenExpirationDate)
    );

    if(loadedUser.token) {
      // this.user.next(loadedUser);
      this.store.dispatch(new AuthActions.Login({
        email: loadedUser.email,
        userId: loadedUser.id,
        token: loadedUser.token,
        expirationDate: new Date(userData._tokenExpirationDate)
      }))
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autologout(expirationDuration)
    }
  }

  logout() {
    // this.user.next(null);
    this.store.dispatch(new AuthActions.logout())
    this.router.navigate(['/auth'])
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autologout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)
  }

  private handleAuthentication(
    email: string, 
    userID: string, 
    token: string, 
    expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
      // this.user.next(user);
      const user = new User(email, userID, token, expirationDate)
      this.store.dispatch(new AuthActions.Login({
        email: email,
        userId: userID,
        token: token, 
        expirationDate: expirationDate
      }))
      this.autologout(expiresIn * 1000);
      localStorage.setItem('userData', JSON.stringify(user))
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'Whoopsie, An unknown error occurred'
      if(!errorRes.error || !errorRes.error.error) {
        return throwError(errorMessage)
      }
      switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'An account with this email already exists'
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'Please sign up for a new account'
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'Password is incorrect'
          break
      }

    return throwError(errorMessage)
  }

}