import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Address, User } from '../../shared/models/user';
import { AuthState } from '../../shared/models/authState';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private httpClient: HttpClient = inject(HttpClient);

  public currentUser: WritableSignal<User | null> = signal<User | null>(null);

  public login(values: any): Observable<User> {
    let params = new HttpParams();
    params = params.append('useCookies', true);

    return this.httpClient.post<User>(environment.apiUrl + 'login', values, { params });
  }

  public register(values: any): Observable<void> {
    return this.httpClient.post<void>(environment.apiUrl + 'account/register', values);
  }

  public getUserInfo(): Observable<User> {
    return this.httpClient.get<User>(environment.apiUrl + 'account/user-info').pipe(
      map(user => {
        this.currentUser.set(user);
        return user;
      }),
    );
  }

  public logout(): Observable<void> {
    return this.httpClient.post<void>(environment.apiUrl + 'account/logout', {});
  }

  public updateAddress(address: Address): Observable<Address> {
    return this.httpClient.post<Address>(environment + 'account/address', address);
  }

  public getAuthState(): Observable<AuthState> {
    return this.httpClient.get<AuthState>(environment.apiUrl + 'account/auth-state');
  }
}
