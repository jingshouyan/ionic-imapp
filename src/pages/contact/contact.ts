import { Component } from '@angular/core';
import { NavController } from 'ionic-angular/umd';
import { ContactProvider } from '../../app/provider/contact.provider';
import { Contact } from '../../app/app.model';
import { SearchPage } from '../search/search';
import { UserPage } from '../user/user';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  contacts: Contact[] = []

  constructor(
    public navCtrl: NavController,
    public contactProvider: ContactProvider,
  ) {
    this.contactProvider.currentContacts.subscribe(c =>{
      this.contacts = c
      console.log(this.contacts)
    })
  }

  search(){
    this.navCtrl.push(SearchPage)
  }

  clickItem(item){
    this.navCtrl.push(UserPage,item)
  }

  delete(item){
    this.contactProvider.delContact(item.id)
    .subscribe(rsp =>{})
  }

}
