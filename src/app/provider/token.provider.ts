import { Injectable } from '@angular/core';
import { Token } from '../app.model';
import { Storage } from '@ionic/storage';
import { Subject, BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class TokenProvider {

  currentToken: Subject<Token> = new BehaviorSubject<Token>(null)

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
    .then()
  }
}