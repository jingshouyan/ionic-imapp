import { Injectable } from "@angular/core";
import { UserProvider } from "./user.provider";
import { ContactProvider } from "./contact.provider";
import { UserInfo } from "../app.model";
import { Observable } from 'rxjs/Rx';

@Injectable()
export class UserInfoProvoider {

  uInfoMap: Observable<{[id: string]: UserInfo}>

  constructor(
    private user: UserProvider,
    private contact: ContactProvider,
  ){

  }

  getUserInfo(id: string,opt: any = {netFirst: false}): Observable<UserInfo>{
    let obs = opt.netFirst ? this.user.getUser(id) : this.user.getUserCache(id);
    return obs
    .map(user =>{
      let contact = this.contact._contactMap[id] || { isContact: false };
      return new UserInfo(Object.assign({isContact: true},contact,user));
    })
  }
}