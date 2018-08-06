import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ContactProvider } from '../../app/provider/contact.provider';
import { UserInfo } from '../../app/app.model';
import { SearchPage } from '../search/search';
import { UserPage } from '../user/user';
import { UserInfoProvoider } from '../../app/provider/userInfo.provider';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  contacts: UserInfo[] = []

  constructor(
    public navCtrl: NavController,
    public contact: ContactProvider,
    public uInfo: UserInfoProvoider,
  ) {
    this.uInfo.contacts
    .do(x => console.info("!!!",x))
    .subscribe(cs =>this.contacts =cs)
  }

  search(){
    this.navCtrl.push(SearchPage)
  }

  clickItem(item){
    this.navCtrl.push(UserPage,item)
  }

  delete(item){
    this.contact.delContact(item.id)
    .subscribe(rsp =>{})
  }

}
