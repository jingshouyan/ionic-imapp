import { Injectable } from "@angular/core";
import { UserProvider } from "./user.provider";
import { ContactProvider } from "./contact.provider";
import { UserInfo } from "../app.model";
import { Observable, Subject } from 'rxjs/Rx';
import _ from 'underscore';

@Injectable()
export class UserInfoProvoider {

  uInfoMap: Observable<{[id: string]: UserInfo}>
  obsMap: {[id: string]: Observable<UserInfo> } = {};
  contacts : Subject<UserInfo[]> = new Subject();
  

  constructor(
    private user: UserProvider,
    private contact: ContactProvider,
  ){
    //每一个好友触发下 准备用户数据
    contact.newContact
    .subscribe(c => this.user.prepare(c.id));    

    // userMap,contactMap 合并为 uInfoMap 流
    this.uInfoMap = user.userMap.combineLatest(contact.contactMap,(umap,cmap) => {
      let uInfoMap: {[id: string]: UserInfo} = {};
      if(umap && cmap){
        const cY = { isContact: true};
        const cN = { isContact: false};
        _.map(umap,(user,id)=>{
          let contact = cmap[id];
          let c = (!contact || contact.deleted()) ? cN : contact;
          let uinfo = new UserInfo(Object.assign(cY,c,user));
          uInfoMap[id] = uinfo;
        });
      }
      return uInfoMap;
    });

    this.uInfoMap.map(imap =>{
      
    })

  }

  getUserInfo(id: string,opt: any = {netFirst: false}): Observable<UserInfo>{
    this.user.prepare(id);
    let obs = this.obsMap[id];
    if(!obs){
      this.user.getUser(id);
      obs = this.uInfoMap
      .map(uMap => uMap[id])
      .filter(u => !!u);
    }
    return obs;
  }
}