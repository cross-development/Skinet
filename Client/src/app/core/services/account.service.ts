import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { SignalrService } from './signalr.service';
import { Address, User } from '../../shared/models/user';
import { AuthState } from '../../shared/models/authState';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private httpClient: HttpClient = inject(HttpClient);
  private signalrService: SignalrService = inject(SignalrService);

  public currentUser: WritableSignal<User | null> = signal<User | null>(null);
  public isAdmin: Signal<boolean> = computed(() => {
    const roles = this.currentUser()?.roles;

    return Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
  });

  public login(values: any): Observable<User> {
    let params = new HttpParams();
    params = params.append('useCookies', true);

    return this.httpClient
      .post<User>(environment.apiUrl + 'login', values, { params })
      .pipe(tap({ next: () => this.signalrService.createHubConnection() }));
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
    return this.httpClient
      .post<void>(environment.apiUrl + 'account/logout', {})
      .pipe(tap({ next: () => this.signalrService.stopHubConnection() }));
  }

  public updateAddress(address: Address): Observable<Address> {
    return this.httpClient.post<Address>(environment + 'account/address', address).pipe(
      tap({
        next: () => {
          this.currentUser.update(user => {
            if (user) {
              user.address = address;
            }

            return user;
          });
        },
      }),
    );
  }

  public getAuthState(): Observable<AuthState> {
    return this.httpClient.get<AuthState>(environment.apiUrl + 'account/auth-state');
  }
}
