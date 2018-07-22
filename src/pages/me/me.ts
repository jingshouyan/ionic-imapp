import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular/umd';
import { User } from '../../app/app.model';
import { UserProvider } from '../../app/provider/user.provider';

/**
 * Generated class for the MePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-me',
  templateUrl: 'me.html',
})
export class MePage {

  me:User = new User

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MePage');
    this.user.currentUser
    .subscribe(user =>{
      console.log(user)
      this.me = user
    });
  }

  logout($event){
    this.user.logout();
  }

}
