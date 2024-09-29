import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  public loading: boolean = false;
  public busyRequestCount: number = 0;

  public busy(): void {
    this.busyRequestCount++;
    this.loading = true;
  }

  public idle(): void {
    this.busyRequestCount--;

    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.loading = false;
    }
  }
}
