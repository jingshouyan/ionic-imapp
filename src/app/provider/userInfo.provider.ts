import { Injectable } from "@angular/core";
import { UserProvider } from "./user.provider";
import { ContactProvider } from "./contact.provider";
import { UserInfo } from "../app.model";
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import _ from 'underscore';

@Injectable()
export class UserInfoProvoider {

  uInfoMap: Observable<{[id: string]: UserInfo}>
  obsMap: {[id: string]: Observable<UserInfo> } = {};
  contacts : Subject<UserInfo[]> = new BehaviorSubject([]);
  

  constructor(
    private user: UserProvider,
    contact: ContactProvider,
  ){
    //每一个好友触发下 准备用户数据
    contact.newContact
    .subscribe(c => this.user.prepare(c.id));    

    // userMap,contactMap 合并为 uInfoMap 流
    // debounceTime 防止运算量过大
    this.uInfoMap = user.userMap.debounceTime(50)
    .combineLatest(contact.contactMap.debounceTime(50),(umap,cmap) => {
      let uInfoMap: {[id: string]: UserInfo} = {};
      if(umap && cmap){
        const cY = { isContact: true};
        const cN = { isContact: false};
        _.map(umap,(user,id)=>{
          let c = cmap[id],uinfo
          if(c && !c.deleted()){
            uinfo = new UserInfo(Object.assign(c,user,cY));
          }else {
            uinfo = new UserInfo(Object.assign(user,cN));
          }
          uInfoMap[id] = uinfo;
        });
      }
      return uInfoMap;
    });

    this.uInfoMap.debounceTime(50).map(imap =>{
      let contacts: UserInfo[] = [];
      _.map(imap,(uinfo) => {
        if(uinfo.isContact){
          contacts.push(uinfo);
        }
      });
      return contacts;
    })
    .subscribe(this.contacts);
  }

  getUserInfo(id: string,opt: any = {ajax: false}): Observable<UserInfo>{
    if (opt.ajax) {
      this.user.getUserAjax(id);
    } else {
      this.user.prepare(id);
    }
    let obs = this.obsMap[id];
    if(!obs){
      obs = this.uInfoMap
      .map(uMap => uMap[id])
      .filter(u => !!u)
      .do(x => console.log("getuserInfo",x));
      this.obsMap[id] = obs;
    }
    return obs;
  }
}