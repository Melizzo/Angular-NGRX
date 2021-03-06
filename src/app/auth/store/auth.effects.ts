import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Actions, ofType, Effect } from '@ngrx/effects'
import { of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

import * as AuthActions from './auth.actions'

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable()
export class AuthEffects {
  // action handler
  // NGRX/effects will subscribe
  // ofType defines the type of effect(like a filter
  // for specific action you want)
  // switchMap creates another observeable from a different observeable. 
  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START), 
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey, 
        {
          email: authData.payload.email,
          password: authData.payload.password, 
          returnSecureToken: true
        }
      ).pipe(
        map(resData => {
          const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
          return of(new AuthActions.Login({
            email: resData.email,
            userId: resData.localId,
            token: resData.idToken,
            expirationDate: expirationDate
          }))
      }),
        catchError(error => {
        return of();
        }), 
      );
    }),
    
  )

  constructor(
    private actions$: Actions,
    private http: HttpClient) {}  
}


function Effect() {
  throw new Error('Function not implemented.')
}
// actions is an observeable/stream of dispatch actions