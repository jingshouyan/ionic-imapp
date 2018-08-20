import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserInfo } from '../../app/app.model';
import { ContactProvider } from '../../app/provider/contact.provider';
import { UserProvider } from '../../app/provider/user.provider';
import { Thread } from './../../app/app.model';
import { ChatPage } from './../chat/chat';
import { UserInfoProvoider } from '../../app/provider/userInfo.provider';
import { Subscription } from 'rxjs/Rx';

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

  userInfo: UserInfo;

  unsub: Subscription

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public contact: ContactProvider,
    public user: UserProvider,
    public uinfo: UserInfoProvoider,
  ) {
    console.log("www",this)
    this.userInfo = new UserInfo(this.navParams.data);
    this.unsub = uinfo.getUserInfo(this.userInfo.id,{ajax: true})
    .do(x => console.log("xxxx",x))
    .subscribe(u => this.userInfo = u);
  }

  ionViewDidLoad(){
      console.log('触发ionViewDidLoad');
  }

  ionViewWillEnter(){
      console.log('触发ionViewWillEnter');
  }

  ionViewDidEnter(){
      console.log('触发ionViewDidEnter');
  }

  ionViewWillLeave(){
      console.log('触发ionViewWillLeave');
  }

  ionViewDidLeave(){
      console.log('触发ionViewDidLeave');
  }

  ionViewWillUnload(){
      console.log('触发ionViewWillUnload');
      // if(this.unsub){
      //   this.unsub.unsubscribe();
      // }
  }


  addContact($event){
    this.contact.addContact({userId: this.userInfo.id})
    .subscribe(rsp => {
      if(rsp.code === 0){
        this.userInfo.isContact = true
      }
    })
  }

  chat($event){
    let thread = new Thread({
      name: this.userInfo.nickname,
      remark: this.userInfo.remark,
      icon: this.userInfo.icon,
      targetId: this.userInfo.id,
      targetType: 'user'
    })
    this.navCtrl.push(ChatPage,thread)
  }

}
