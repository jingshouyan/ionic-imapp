import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';
import { User, Login, Token, Register } from '../app.model';
import { TokenProvider } from './token.provider';
import { DbProvider, TABLES } from './db.provider';
import { Storage } from '@ionic/storage';
import { ApiProvider } from './api.provider';
import _ from 'underscore';

interface IUserOpt extends Function {
  (uMap: {[id: string]: User}): {[id: string]: User};
}
@Injectable()
export class UserProvider {

  newUser: Subject<User> = new Subject();
  userUpdates: Subject<IUserOpt> = new Subject();
  userMap: Observable<{[id: string]: User}>


  currentUser: Subject<User> = new BehaviorSubject<User>(new User)
  currentLogin: Subject<Login> = new BehaviorSubject<Login>(new Login)
  cacheChange: Subject<User> = new Subject<User>()

  t: Token = new Token
  userCache: {[id: string]: User} = {}
  constructor(
    private api: ApiProvider,    
    private token: TokenProvider,
    private db: DbProvider,
    private storage: Storage,
  ){
    // update 流 计算得到 userMap
    this.userMap = this.userUpdates
    .scan((uMap: {[id: string]: User},opt: IUserOpt) => {
      return opt(uMap);
    },{}).publishReplay(1).refCount();

    //新用户流 导入 更新留
    this.newUser.map((u): IUserOpt =>{
      return uMap => {
        uMap[u.id] = u;
        return uMap;
      };
    }).subscribe(this.userUpdates);

    //从网络请求获取的信息 入库
    this.newUser.filter(u => !u._db)
    .subscribe(u =>{
      this.db.replace(u,TABLES.User).subscribe(()=>{});
    });

    //检查 token，获取个人信息
    token.currentToken.filter(t => {
      return t && t.usable();
    }).subscribe(t =>{
      this.t = t;
      this.me();
    });

    //获取登陆设置
    storage.get("login").then(value =>{
      if(value){
        let login = new Login(JSON.parse(value))
        this.currentLogin.next(login)
      }      
    });

   }

   uMap(ids: string[]){
     let obs: Subject<{[id: string]: User}> = new Subject();
     let noCache: string[] = [];
     let db = false;
     let ajax = false;
     this.userMap.flatMap(uMap => {
       if(!db) {
         db = true;
         _.chain(ids).forEach( id => {
          let u = uMap[id];
          u || noCache.push(id);
         });
         console.info("nocache",noCache);
         if(noCache.length > 0){
          return this.db.list(TABLES.User,"id in (?)",[noCache])
          .map(rows =>{
            _.chain(rows).forEach(row => {
              let u = new User(row);
              u._db = true;
              uMap[u.id] = u;
              this.newUser.next(u);
              noCache = noCache.filter(id => id == u.id);
            });
            return uMap;
          });
         } else {
          return Observable.of(uMap);
         }
       } else {
        return Observable.of(uMap);
       } 
     }).flatMap(uMap =>{
        console.info("nocache",noCache);
        if(!ajax && noCache.length > 0){
          return this.getUsers(noCache);
        } else {
          return Observable.of(uMap);
        }
     }).subscribe(obs).unsubscribe();
     return obs;
   }

  // 通过网络获取多个用户信息，并将每一个用户发输出到 newUser
  getUsers(ids: string[]):Observable<{[id: string]: User}>{
    const endpoint = "user/GetUser.json"  
    return this.api.post(endpoint,{ids: ids})
    .map(rsp => {
      let uMap: {[id: string]: User} = {};
      if(rsp.code === 0 && rsp.data.length > 0){
        _.chain(rsp.data).forEach(row => {
          let u = new User(row);
          uMap[u.id] = u;
          this.newUser.next(u);
        });
        return uMap;
      }
    });
  }
  //通过网络获取单个用户信息
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
      let user: User = new User
      if(rsp.code === 0 && rsp.data.length > 0){
        user = new User(rsp.data[0])
        this.cache(user)
      }
      return user
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
        this.t = new Token(rsp.data);
        this.token.setToken(this.t)
      }
      return rsp
    })
  }

  me(){
    this.db.find(TABLES.User,this.t.userId)
    .subscribe(value => {
      this.currentUser.next(new User(value));
      const endpoint = "user/Me.json"    
      this.api.post(endpoint,{})
      .subscribe(rsp =>{
        if(rsp.code === 0 && rsp.data){
          let user = new User(rsp.data);
          this.currentUser.next(user);
          this.newUser.next(user);
        }
      });
    });    
  }

  logout(){
    const endpoint = "user/Logout.json"    
    this.api.post(endpoint,{})
    .subscribe(rsp => {})
    this.token.setToken(new Token)
  }

  register(reg: Register){
    const endpoint = "user/RegUser.json"
    return this.api.post(endpoint, reg)    
  }

  search(q: string): Observable<User[]>{
    const endpoint = "user/SearchUser.json"
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
    return this.getUserMap2([id])
    .map(userMap => {
      return userMap[id] || new User
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
      .subscribe(rows => {
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
              _.chain(rsp.data).forEach(row =>{
                let user = new User(row)
                users[user.id] = user
                this.cache(user)
              })
            }
            usersSub.next(users)
          })
        }
      })
    }  
    return usersSub
  }


  getUserMap2(ids: string[]): Observable<void>{
    let fun = (callback) =>{
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
        callback(users)
      }
      else{
        this.db.list(TABLES.User,"id in (?)",[idNoCache])
        .subscribe(rows => {
          rows.forEach(row =>{
            let user = new User(row)
            users[user.id] = user
            this.userCache[user.id] = user
            idNoCache = idNoCache.filter(id => id != user.id)          
          })
          if(idNoCache.length === 0){
            callback(users)
          }else{
            const endpoint = "user/GetUser.json"  
            this.api.post(endpoint,{ids: idNoCache})
            .subscribe(rsp =>{
              if(rsp.code === 0 && rsp.data.length > 0){
                _.chain(rsp.data).forEach(row =>{
                  let user = new User(row)
                  users[user.id] = user
                  this.cache(user)
                })
              }
              callback(users)
            })
          }
        })
      }
      return users;
    }
    let obs = Observable.bindCallback(fun)
    return obs();
  }



  private cache(user: User){
    this.userCache[user.id] = user
    this.db.replace(user,TABLES.User)
    this.cacheChange.next(user)
  }
}
