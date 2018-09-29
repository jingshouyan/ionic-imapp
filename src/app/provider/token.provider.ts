import { Injectable } from '@angular/core';
import { Token } from '../app.model';
import { Storage } from '@ionic/storage';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';

@Injectable()
export class TokenProvider {

  currentToken: Subject<Token> = new BehaviorSubject<Token>(null)

  tokenChange: Observable<Token> = this.currentToken.filter(t => t && t.usable());

  constructor(
    private storage: Storage,
  ){
    storage.get('token')
      .then(tokenStr => {
        if(tokenStr) {
          let token = new Token(JSON.parse(tokenStr))
          this.currentToken.next(token)
        }else{
          this.currentToken.next(new Token)
        }
      })
  }

  setToken(token:Token): Promise<any>{
    this.currentToken.next(token)
    return this.storage.set('token',JSON.stringify(token))    
  }
}