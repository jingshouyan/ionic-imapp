import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular/umd';
import { UserProvider } from '../../app/provider/user.provider';
import { Register, Login } from '../../app/app.model';

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  reg:Register = new Register

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public user: UserProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  register(){

    this.user.register(this.reg)
    .subscribe(rsp => {
      if(rsp.code === 0){
        let login = new Login(this.reg)
        this.user.login(login)
        .subscribe(rsp => {})
      }
    })
  }

}
