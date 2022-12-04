import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const API_URL = 'https://api2.sota.org.uk/api/';

export type Spot = {
  id: number,
  userID: number,
  timeStamp: Date,
  comments: string,
  callsign: string,
  associationCode: string,
  summitCode: string,
  activatorCallsign: string,
  activatorName: string,
  frequency: string,
  mode: string,
  summitDetails: string,
  highlightColor: string,
}

@Injectable({
  providedIn: 'root'
})
export class SpotsService {

  constructor( private http: HttpClient ) { }

  fetchSpots(limit: number): Observable<Spot[]> {
    const endpoint = `${API_URL}spots/${limit}/all`
    const response = this.http
      .get<Spot[]>(endpoint);
    return response
  }
}
