import { Component, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { buffer, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { ServiceConfig } from './dataTransferObjects';


export interface IUser {
  email: string;
  avatarUrl?: string
}

const defaultPath = '/';


interface UserResponse{
  UserName : string;
}

@Injectable()
export class AuthService {
  private _user: IUser | null = null;
  static serviceConfig: ServiceConfig = { serviceUrl: "./api" };

  get loggedIn(): boolean {
    return !!this.cookieService.get("X-ss-id");
  }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private router: Router, private http: HttpClient, private cookieService : CookieService) 
  {
    this.getConfig()
            .subscribe((data: ServiceConfig) => {
                let url = "./api";
                if (data.serviceUrl)
                    url = data.serviceUrl;
                AuthService.serviceConfig = { serviceUrl: url }
            });
  }

  configUrl = 'assets/config.json';

    getConfig() {
        return this.http.get<ServiceConfig>(this.configUrl);
  }
  
  logIn(username: string, password: string) {
    let url = AuthService.serviceConfig.serviceUrl + "Auth/Login";
    let result = {isOk: false, data: ''};
    this.http.post<UserResponse>(url, {username: username, password: password }).subscribe({
      next: (res) => {
        result.isOk = true;
        result.data = res.UserName;
      },
      error: (err: Error) => {
        result.isOk = false;
        result.data = err.message
      }
    });
    return result;
    // return this.http.post<UserResponse>(url, {username: username, password: password })
    //     .pipe(
    //       map(resp => {
    //         console.log("SSSSSSSSSSSSSS");
    //         result.data = resp.UserName;
    //         result.isOk = true;
    //         //this.cookieService.set("X-ss-id", resp.SessionId);
    //         return result;
    //       }),
    //       catchError(error => {
    //         result.isOk = false;
    //         return of(result);
    //       })
    //     );
    
  }

  async getUser() {
    try {
      // Send request

      return {
        isOk: true,
        data: this._user
      };
    }
    catch {
      return {
        isOk: false,
        data: null
      };
    }
  }

  async createAccount(email: string, password: string) {
    try {
      // Send request
      console.log(email, password);

      this.router.navigate(['/create-account']);
      return {
        isOk: true
      };
    }
    catch {
      return {
        isOk: false,
        message: "Failed to create account"
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request
      console.log(email, recoveryCode);

      return {
        isOk: true
      };
    }
    catch {
      return {
        isOk: false,
        message: "Failed to change password"
      }
    };
  }

  async resetPassword(email: string) {
    try {
      // Send request
      console.log(email);

      return {
        isOk: true
      };
    }
    catch {
      return {
        isOk: false,
        message: "Failed to reset password"
      };
    }
  }

  async logOut() {
    this._user = null;
    this.cookieService.delete("X-ss-id");
    this.router.navigate(['/login-form']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    const isAuthForm = [
      'login-form',
      'reset-password',
      'create-account',
      'change-password/:recoveryCode'
    ].includes(route.routeConfig?.path || defaultPath);

    if (isLoggedIn && isAuthForm) {
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }

    if (!isLoggedIn && !isAuthForm) {
      this.router.navigate(['/login-form']);
    }

    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
    }

    return isLoggedIn || isAuthForm;
  }
}
