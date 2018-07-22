import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular/umd';
import { UserInfo } from '../../app/app.model';
import { ContactProvider } from '../../app/provider/contact.provider';
import { UserProvider } from '../../app/provider/user.provider';

/**
 * Generated class for the UserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {

  userInfo: UserInfo = new UserInfo

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public contact: ContactProvider,
    public user: UserProvider,
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPage');
    this.userInfo = new UserInfo(this.navParams.data)
    console.log(this.userInfo)
    let c = this.contact.getContact(this.userInfo.id)
    console.log(this.userInfo)
    if(c){
      this.userInfo.remark = c.remark
      this.userInfo.isContact = true
      console.log(this.userInfo)
    }
    this.user.getUser(this.userInfo.id)
    .subscribe(user => {
      this.userInfo = Object.assign({},this.userInfo,user)
    })
  }

  addContact($event){
    this.contact.addContact({userId: this.userInfo.id})
    .subscribe(rsp => {
      if(rsp.code === 0){
        this.userInfo.isContact = true
      }
    })
  }

}
