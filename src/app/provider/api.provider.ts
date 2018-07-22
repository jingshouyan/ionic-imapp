import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Rsp } from '../app.model';

@Injectable()
export class ApiProvider {

  // url:string = "http://127.0.0.1:9000/api/"
  url:string = "/api/"
  constructor(
    private http:HttpClient,
  ) { }

  post(endpoint: string,data:any,isLoading?: boolean): Observable<Rsp>{
    let headers = {}
    if(isLoading )headers["loading"] = "true"
    return this.http.post<Rsp>(this.url+endpoint,data,{headers:headers})
  }
}