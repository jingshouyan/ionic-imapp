import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ThreadPage } from './thread';

@NgModule({
  declarations: [
    ThreadPage,
  ],
  imports: [
    IonicPageModule.forChild(ThreadPage),
  ],
})
export class ThreadPageModule {}
