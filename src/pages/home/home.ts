import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, App, Events, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  reorder: boolean = true;
  checkboxs: any[] = [
    { name : 'A', checked : true },
    { name : 'B', checked : false },
    { name : 'C', checked : true },
    { name : 'D', checked : false },
    { name : 'E', checked : true },
  ];

  myDate: string = '2018-08-01T02:02:01Z';
  pepperoni: boolean = true;

  constructor(public navCtrl: NavController, 
    public actionsheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public app: App,
    public events: Events,
    public modalCtrl: ModalController,
  ) {
    
  }
  saveItem(item: any){
    console.log(item);
  }

  bClick($event: any){
    this.reorder = !this.reorder;
    let str = this.checkboxs.map(i=>i.name+":"+i.checked).join(",");
    console.log(this.checkboxs,str);
    console.log(this.myDate);
    this.events.publish('eee',str);
    this.persentModal();
  }
  
  persentModal(){

  }

  alert1($event: any){
    let alert1 = this.alertCtrl.create({
      title: 'alert',
      subTitle: 'sub title',
      message: 'this is message',
      inputs: [
        {
          name: 'username',
          value: 'username',
          placeholder: 'Please enter username.',
          label: 'username',
          type: 'radio'
        },
        {
          name: 'password',
          label: 'password',
          value: 'password',
          checked: true,
          placeholder: 'Please enter password.',
          type: 'radio',
          id: 'id-password'
        }
      ],
      buttons: [
        {      
          text: 'OK',
          handler: ($e: any) => {
            console.log($e);
            console.log('OK',$e,alert1);
          }
        },
        {      
          text: 'Cancel',
          role: 'cancel',
          handler: ($e: any) => {
            console.log('cancel',$e);
          }
        },
      ]
    });
    alert1.present();
  }

  actionSheetF($event: any) {
    console.log($event);
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Modify your album',
      subTitle: 'This is subTitle',
      buttons: [
        {
          text: 'Destructive',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          text: 'Archive',
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Play',
          handler: () => {
            console.log('Play clicked');
            let navTransition = actionSheet.dismiss();
            navTransition.then(()=>{
                this.navCtrl.pop();
            });
            return false;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

}
