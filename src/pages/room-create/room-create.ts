import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserInfoProvoider } from '../../app/provider/userInfo.provider';
import { Observable } from 'rxjs';
import { UserInfo } from '../../app/app.model';
import _ from 'underscore';

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
    ) {
    this.contacts = uInfo.contacts
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomCreatePage');
  }

  createRoom(){
    const userIds = _.chain(this.selected).map((v,k) => v?k:"").filter(v => !!v).value();
    console.log(userIds);
  }

  selectNum(){
    return _.chain(this.selected).filter(x => !!x).size().value();
  }

}
