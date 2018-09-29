import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { Contact, Rsp, Conf } from '../app.model';
import { DbProvider, TABLES } from './db.provider';
import { TokenProvider } from './token.provider';
import { ApiProvider } from './api.provider';
import _ from 'underscore';

interface IContactOpt extends Function {
  (cMap: {[id: string]: Contact}): {[id: string]: Contact};
}
@Injectable()
export class ContactProvider {

  newContact: Subject<Contact> = new Subject();
  contactMap: Observable<{[id: string]: Contact}>;
  contactUpates: Subject<IContactOpt> = new Subject();
  // contacts: Subject<Contact[]> = new Subject();

  

  revision: number = 0;
  constructor(
    private api: ApiProvider,
    private db: DbProvider,
    token: TokenProvider,
  ){

    // update 流推送到 contactMap
    this.contactMap = this.contactUpates
    .scan((cMap:{[id: string]: Contact},opt:IContactOpt) => {
      return opt(cMap);
    },{}).publishReplay(1).refCount();

    //当 token 变化时，推送清除数据操作到 threadUpdates
    token.tokenChange
    .map((): IContactOpt => {
      console.log("token change init contacts !!");
      return (map:{[id: string]: Contact}) => {
        return {};
      };
    })
    .subscribe(this.contactUpates);

    // newContact 更新到 update 
    this.newContact.map((contact): IContactOpt => {
      return (cMap) =>{
        let map = {};
        map[contact.id] = contact;
        cMap = Object.assign({},cMap,map);
        return cMap;
      };
    }).subscribe(this.contactUpates);

    // 存储到db
    this.newContact.subscribe(contact => {
      if(!contact._db ){
        this.db.replace(contact,TABLES.Contact);
      }
    });

    // 
    this.newContact
    .map(contact => contact.revision)
    .filter(revision => revision > this.revision)
    .subscribe(revision => this.revision = revision);



    //当 token 变化时，加载数据库数据
    token.tokenChange
    .subscribe(() =>{
      this.revision = 0;
      this.db.list(TABLES.Contact)
      .subscribe(rows =>{
        _.chain(rows).forEach(row => {
          let contact = new Contact(row)
          contact._db = true;
          this.newContact.next(contact);
        });
        this.syncContacts();
      });
    });
  }


  



  // 通过网络同步数据
  private syncContacts(){
    this.listContact(this.revision)
    .filter(rsp => rsp.code === Rsp.SUCCESS && rsp.data.length > 0)
    .map(
      rsp => _.chain(rsp.data).map(row => {
        row.id = row.userId;
        const contact = new Contact(row);
        return contact;
      }).value()
    )
    .do(cs => 
      cs.forEach(contact => this.newContact.next(contact))
    )
    .map(cs => cs.length)
    .filter(size => size === Conf.BATCH_SIZE)
    .subscribe(size =>this.syncContacts());        
  }


  private listContact(revision) {
    let endpoint = "relationship/listContact.json"
    return this.api.post(endpoint,{revision: revision,size: Conf.BATCH_SIZE})    
  }


  //添加联系人
  addContact(opt: any){
    let endpoint = "relationship/addContact.json"
    return this.api.post(endpoint,{userId: opt.userId,remark: opt.remark,type: opt.type})
    .map(rsp =>{
      if(rsp.code === Rsp.SUCCESS){
        this.syncContacts()
      }
      return rsp
    })
  }

  //删除联系人
  delContact(id: string){
    let endpoint = "relationship/delContact.json"
    return this.api.post(endpoint,{userId:id})
    .map(rsp=>{
      if(rsp.code === Rsp.SUCCESS){
        this.syncContacts()
      }
      return rsp
    })
  }

}
