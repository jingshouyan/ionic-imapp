import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs/Rx';
import { Contact } from '../app.model';
import { DbProvider, TABLES } from './db.provider';
import { TokenProvider } from './token.provider';
import { ApiProvider } from './aip.provider';

@Injectable()
export class ContactProvider {

  currentContacts: Subject<Contact[]> = new BehaviorSubject<Contact[]>([])
  contactMap: {[id: string]: Contact} = {}
  revision: number = 0
  constructor(
    private api: ApiProvider,
    private db: DbProvider,
    private token: TokenProvider,
  ){
    token.currentToken.subscribe(token =>{
      if(token && token.usable()){
        this.loadData()
      }
    })
  }

  loadData(){    
    this.db.list(TABLES.Contact)
    .then(rows =>{
      rows.forEach(row => {
        let contact = new Contact(row)
        this.contactMap[contact.id] = contact
        if(contact.revision > this.revision){
          this.revision = contact.revision
        }
      })
      this.pushContacts()
      return this.revision
    })
    .then(revision => {
      console.log("loaddata,version",revision)
      this.listContact(revision)
      .subscribe(rsp => {
        if(rsp.code === 0){
          rsp.data.forEach(row => {
            row["id"] = row["userId"]
            let contact = new Contact(row)
            this.db.replace(contact,TABLES.Contact)
            this.contactMap[contact.id] = contact
            if(contact.revision > this.revision){
              this.revision = contact.revision
            }
          })
          this.pushContacts()
        }
      })
    })
  }

  private pushContacts(){
    let contacts: Contact[] = []
    for(let id in this.contactMap){
      let contact = this.contactMap[id]
      if(contact.deletedAt<0){
        contacts.push(contact)
      }
    }
    console.log("push contacts",contacts)
    this.currentContacts.next(contacts)
  }

  private listContact(revision) {
    let endpoint = "relationship/ListContact.json";
    return this.api.post(endpoint,{revision: revision})    
  }
}
