import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular/umd';
import { MePage } from './me';

@NgModule({
  declarations: [
    MePage,
  ],
  imports: [
    IonicPageModule.forChild(MePage),
  ],
})
export class MePageModule {}
