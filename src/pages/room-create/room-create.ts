import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserInfoProvoider } from '../../app/provider/userInfo.provider';
import { Observable } from 'rxjs';
import { UserInfo, Rsp, Room } from '../../app/app.model';
import _ from 'underscore';
import { RoomProvider } from '../../app/provider/room.provider';
import { ChatPage } from '../chat/chat';

/**
 * Generated class for the RoomCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-create',
  templateUrl: 'room-create.html',
})
export class RoomCreatePage {

  selected = {};

  contacts: Observable<UserInfo[]>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public uInfo: UserInfoProvoider,
    public room: RoomProvider,
    ) {
    this.contacts = uInfo.contacts
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomCreatePage');
  }

  createRoom(){
    const userIds = _.chain(this.selected).map((v,k:string) => v?k:"").filter(v => !!v).value();
    console.log(userIds);
    this.room.create(userIds,"测试"+ new Date().getTime())
    .filter(rsp => rsp.code === Rsp.SUCCESS)
    .map(rsp => new Room(rsp.data))
    .subscribe(room => {
      this.navCtrl.push(ChatPage,room);
    });
  }

  selectNum(){
    return _.chain(this.selected).filter(x => !!x).size().value();
  }

}
