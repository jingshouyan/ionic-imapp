import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserInfo } from '../../app/app.model';
import { SearchPage } from '../search/search';
import { UserPage } from '../user/user';
import { UserInfoProvoider } from '../../app/provider/userInfo.provider';
import { Observable } from 'rxjs/Rx';
import { ContactProvider } from '../../app/provider/contact.provider';
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {


  contacts: Observable<UserInfo[]>;

  constructor(
    public navCtrl: NavController,
    public uInfo: UserInfoProvoider,
    public contact: ContactProvider,
  ) {
    this.contacts = uInfo.contacts
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
