import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ContactProvider } from '../../app/provider/contact.provider';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(
    public navCtrl: NavController,
    public contactProvider: ContactProvider,
  ) {

  }

}
