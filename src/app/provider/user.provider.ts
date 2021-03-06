import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs/Rx';
import { User, Login, Token, Register, Rsp } from '../app.model';
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
  userMap: Observable<{[id: string]: User}>;
  _userMap: {[id: string]: User} = {};
  uid: Subject<string> = new Subject();

  // 当前登录用户信息
  currentUser: Subject<User> = new BehaviorSubject<User>(new User)
  currentLogin: Subject<Login> = new BehaviorSubject<Login>(new Login)

  t: Token = new Token
  userCache: {[id: string]: User} = {}
  constructor(
    private api: ApiProvider,
    private token: TokenProvider,
    private db: DbProvider,
    private storage: Storage,
  ){

    this.uid.distinctUntilChanged()
    .bufferTime(50)
    .filter(x => x.length > 0)
    .do(x => console.log(x))
    .subscribe(ids => this.prepares(ids));

    // update 流 计算得到 userMap
    this.userMap = this.userUpdates
    .scan((uMap: {[id: string]: User},opt: IUserOpt) => {
      return opt(uMap);
    },{}).publishReplay(1).refCount();

    // 暂时先把 map 放出来
    this.userMap.subscribe(map => this._userMap = map);

    //新用户流 导入 更新留
    this.newUser.map((u): IUserOpt =>{
      return uMap => {
        let map = {};
        map[u.id] = u;
        uMap = Object.assign({},uMap,map);
        return uMap;
      };
    }).subscribe(this.userUpdates);

    //从网络请求获取的信息 入库
    this.newUser.filter(u => !u._db)
    .subscribe(u =>{
      this.db.replace(u,TABLES.User).subscribe();
    });

    //检查 token，获取个人信息
    token.tokenChange
    .subscribe(t =>{
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

   private _idCache: {[id:string]: number} = {};
   // 准备数据
   prepare(id){
     let u = this._userMap[id];
     if(u){
       return;
     }
     let now = new Date().getTime();
     let idTime = this._idCache[id];
     if(!idTime || (now -idTime) > 10000){
      this._idCache[id] = now;
      this.uid.next(id);
     }
   }

   getUser(id: string):Observable<User>{
    return this.userMap
    .map(umap =>umap[id])
    .filter(u => !!u);
   }

   // 准备数据
   private prepares(ids: string[]){
     console.log(ids);
     if(ids.length == 0){
       return;
     }
     let noCache: string[] = [];
     _.chain(ids).forEach(id =>{
      this._userMap[id] || noCache.push(id);
     });
     if(noCache.length > 0){
      this.db.list(TABLES.User,"id in (?)",[noCache])
      .subscribe(rows => {
       _.chain(rows).forEach(row => {
         let u = new User(row);
         u._db = true;
         this.newUser.next(u);
         noCache = noCache.filter(id => u.id == id);
       });
       if(noCache.length > 0){
         console.log(ids,noCache);
         this.getUsersAjax(noCache).subscribe();
       }
      });
     }
   }

  // 通过网络获取多个用户信息，并将每一个用户发输出到 newUser
  private getUsersAjax(ids: string[]):Observable<{[id: string]: User}>{
    const endpoint = "user/getUser.json"  
    return this.api.post(endpoint,{ids: ids})
    .map(rsp => {
      let uMap: {[id: string]: User} = {};
      if(rsp.code === Rsp.SUCCESS && rsp.data.length > 0){
        _.chain(rsp.data).forEach(row => {
          let u = new User(row);
          uMap[u.id] = u;
          this.newUser.next(u);
        });
        return uMap;
      }
    });
  }
  //通过网络获取单个用户信息, 10 秒内数据为有效数据
  getUserAjax(id: string): Observable<User>{
    let now = new Date().getTime();
    console.log("getUser",id);
    let sub = new Subject<User>();
    let user = this._userMap[id]
    sub.next(user || new User)
    console.log(user);
    if(!user || (now -user.loadTime()) > 10000){
      this.getUsersAjax([id]).subscribe(uMap =>{
        sub.next(uMap[id] || new User);        
      })
    }
    return sub;
  }

  login(login:Login){
    const endpoint = "user/login.json"
    return this.api.post(endpoint,login,true)
    .map(rsp => {
      if(rsp.code === Rsp.SUCCESS){
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
      const endpoint = "user/me.json"    
      this.api.post(endpoint,{})
      .subscribe(rsp =>{
        if(rsp.code === Rsp.SUCCESS && rsp.data){
          let user = new User(rsp.data);
          this.currentUser.next(user);
          this.newUser.next(user);
        }
      });
    });    
  }

  logout(){
    const endpoint = "user/logout.json"    
    this.api.post(endpoint,{})
    .subscribe(rsp => {})
    this.token.setToken(new Token)
  }

  register(reg: Register){
    const endpoint = "user/regUser.json"
    return this.api.post(endpoint, reg)    
  }

  search(q: string): Observable<User[]>{
    const endpoint = "user/searchUser.json"
    return this.api.post(endpoint,{q:q})
    .map(rsp =>{
      let users: User[] = []
      if(rsp.code === Rsp.SUCCESS && rsp.data.list.length >0){
        rsp.data.list.forEach(row => {
          let user = new User(row)
          users.push(user)
        })
      }
      return users
    })
  }

  
}
