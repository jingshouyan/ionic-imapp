import { Injectable } from '@angular/core'  
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';  
import { Observable } from 'rxjs/Rx';  
import 'rxjs/add/operator/do';  
import { UUID } from 'angular2-uuid';
import { ToastController, LoadingController, Loading } from 'ionic-angular';
import { TokenProvider } from './provider/token.provider';
import { Token } from './app.model';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private ticket = '';
  constructor(
    private tokenProvider: TokenProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ){
    tokenProvider.currentToken
    .subscribe(token => {
      this.ticket = token && token.ticket || ''
      console.log("TokenInterceptor.ticket:"+this.ticket)
    })
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    let isloading = req.headers.get("loading")=="true" 
    let loading = this.createLoader();
    if(isloading) loading.present()
    const dummyReq = req.clone({
      setHeaders: {
        'Ticket': this.ticket,
        'Trace-Id': this.traceId(),
      }
    });
    console.log(dummyReq)
    let obs = next.handle(dummyReq)
    .retry(3)
    .map(rsp => {
      if(rsp instanceof HttpResponse){
        let code = rsp.body['code']
        let message = rsp.body['message']
        if(isloading) loading.dismiss()
        if(code !==0) this.toast(`[ ${code} ] ${message}`)
        if(code === 10005) this.tokenProvider.setToken(new Token)
      }         
      console.log(rsp);
      return rsp;
    }).catch(err => {  
        console.log(err);  
        isloading && loading.dismiss()   
        this.toast(err.statusText);        
        return Observable.of(err);  
    });  
    return obs;
  }

  traceId(){
    return UUID.UUID();
  }
  toast(msg:string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'bottom'
    });
    toast.present();
  }

  createLoader():Loading {
    let loading =this.loadingCtrl.create({
      spinner: "bubbles",
      content: "loading..."
    });
    return loading;
  }

  
}
