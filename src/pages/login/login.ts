import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Login } from '../../app/app.model';
import { UserProvider } from '../../app/provider/user.provider';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loginModal:Login = new Login;


  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public toastCtrl: ToastController,
     private userProvider: UserProvider,
    ) {
    userProvider.currentLogin.subscribe(value => {
      this.loginModal = value
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login($event){
    if(!this.loginModal.username){
      this.toast("username is empty.")
      return false;
    }

    if(!this.loginModal.password){
      this.toast("password is empty.")
      return false;
    }
    this.userProvider.login(this.loginModal).subscribe(rsp => {});
  }

  toast(msg:string){
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'bottom'
    });
    toast.present();
  }

}
