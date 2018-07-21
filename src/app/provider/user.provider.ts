import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';
import { User, Login, Token, Register } from './../app.model';
import { TokenProvider } from './token.provider';
import { DbProvider, TABLES } from './db.provider';
import { Storage } from '@ionic/storage';
import { ApiProvider } from './aip.provider';

@Injectable()
export class UserProvider {

  currentUser: Subject<User> = new BehaviorSubject<User>(new User)
  currentLogin: Subject<Login> = new BehaviorSubject<Login>(new Login)
  cacheChange: Subject<User> = new Subject<User>()

  token: Token = new Token
  userCache: {[id: string]: User} = {}
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

  search(q: string): Observable<User[]>{
    const endpoint = "user/Search.json"
    return this.api.post(endpoint,{q:q})
    .map(rsp =>{
      let users: User[] = []
      if(rsp.code === 0 && rsp.data.length >0){
        rsp.data.forEach(row => {
          let user = new User(row)
          users.push(user)
        })
      }
      return users
    })
  }

  getUserCache(id: string): Observable<User>{
    return this.getUserMap([id])
    .map(userMap => {
      return userMap[id]
    })
  }

  getUserMap(ids: string[]): Subject<{[id: string]: User}>{
    let usersSub: Subject<{[id: string]: User}> = new Subject<{[id: string]: User}>()
    let users: {[id: string]: User} = {}
    let idNoCache: string[] = []
    ids.forEach(id =>{
      let user = this.userCache[id]
      if(user){
        users[user.id] = user
      }else{
        idNoCache.push(id)
      }
    })
    if(idNoCache.length === 0){
      usersSub.next(users)
    }
    else{
      this.db.list(TABLES.User,"id in (?)",[idNoCache])
      .then(rows => {
        rows.forEach(row =>{
          let user = new User(row)
          users[user.id] = user
          this.userCache[user.id] = user
          idNoCache = idNoCache.filter(id => id != user.id)          
        })
        if(idNoCache.length === 0){
          usersSub.next(users)
        }else{
          const endpoint = "user/GetUser.json"  
          this.api.post(endpoint,{ids: idNoCache})
          .subscribe(rsp =>{
            if(rsp.code === 0 && rsp.data.length > 0){
              rsp.data.foreach(row =>{
                let user = new User(row)
                users[user.id] = user
                this.cache(user)
              })
            }
          })
        }
      })
    }  
    return usersSub
  }

  getUser(id: string): Observable<User>{
    let userSub = new Subject<User>()
    let user = this.userCache[id]
    if(user && user.loadTime() < 5000){
      userSub.next(user)
      return userSub
    }
    const endpoint = "user/GetUser.json"  
    return this.api.post(endpoint,{ids: [id]})
    .map(rsp =>{
      let user: User = undefined
      if(rsp.code === 0 && rsp.data.length > 0){
        user = new User(rsp.data[0])
        this.cache(user)
      }
      return user
    })
  }

  private cache(user: User){
    this.userCache[user.id] = user
    this.db.replace(user,TABLES.User)
    this.cacheChange.next(user)
  }
}
