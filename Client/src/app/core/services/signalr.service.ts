import { Injectable, signal, WritableSignal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Order } from '../../shared/models/order';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  public hubConnection?: HubConnection;
  public orderSignal: WritableSignal<Order | null> = signal<Order | null>(null);

  public createHubConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('OrderCompleteNotification', (order: Order) => {
      this.orderSignal.set(order);
    });
  }

  public stopHubConnection(): void {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }
}
