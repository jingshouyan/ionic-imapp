import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../app/provider/user.provider';
import { MePage } from '../me/me';
import { UserPage } from '../user/user';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  users: any[]

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public user: UserProvider,
  ) {
  }

  ionViewDidLoad() {
  }

  search(q){
    if(!q){
      return
    }
    this.user.search(q)
    .subscribe(users => {
      this.users = users
      console.log(this.users);
    });
  }

  clickItem(user){
    if(user.id == this.user.t.userId){
      this.navCtrl.push(MePage)
    }
    else{
      this.navCtrl.push(UserPage,user)
    }
  }

}
