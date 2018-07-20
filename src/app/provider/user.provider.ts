import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs/Rx';
import { User, Login, Token, Register } from './../app.model';
import { TokenProvider } from './token.provider';
import { DbProvider, TABLES } from './db.provider';
import { Storage } from '@ionic/storage';
import { ApiProvider } from './aip.provider';

@Injectable()
export class UserProvider {

  currentUser: Subject<User> = new BehaviorSubject<User>(new User)
  currentLogin: Subject<Login> = new BehaviorSubject<Login>(new Login)
  token: Token = new Token
  constructor(
    private api: ApiProvider,    
    private tokenProvider: TokenProvider,
    private db: DbProvider,
    private storage: Storage,
  ){
    tokenProvider.currentToken.subscribe(token =>{
      if(token && token.usable()){
        this.token = token;
        console.log(token)
        this.loadData()
      }
    })
    storage.get("login").then(value =>{
      if(value){
        let login = new Login(JSON.parse(value))
        this.currentLogin.next(login)
      }
      
    })
   }

  login(login:Login){
    const endpoint = "user/Login.json"
    return this.api.post(endpoint,login,true)
    .map(rsp => {
      if(rsp.code === 0){
        if(login.remember){
          this.storage.set("login",JSON.stringify(login))
          this.currentLogin.next(login)
        }else{
          let l = new Login({username:login.username})
          this.storage.set("login",JSON.stringify(l))
          this.currentLogin.next(l)
        }
        this.token = new Token(rsp.data);
        this.tokenProvider.setToken(this.token)
      }
      return rsp
    })
  }

  loadData(){
    this.db.find(TABLES.User,this.token.userId)
    .then(value => {
      console.log(value)
      this.currentUser.next(new User(value))
    })
    .then(value =>{
      const endpoint = "user/Me.json"    
      this.api.post(endpoint,{})
      .subscribe(rsp =>{
        if(rsp.code ===0 && rsp.data){
          let user = new User(rsp.data)
          this.db.replace(user,TABLES.User)
          .then(value => this.currentUser.next(user))
          .catch(e => console.log(e))
        }
      })
    })    
  }

  logout(){
    const endpoint = "user/Logout.json"    
    this.api.post(endpoint,{})
    .subscribe(rsp => {})
    this.tokenProvider.setToken(new Token)
  }

  register(reg: Register){
    const endpoint = "user/RegUser.json"
    return this.api.post(endpoint, reg)    
  }
}
