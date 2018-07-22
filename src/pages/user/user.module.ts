import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular/umd';
import { UserPage } from './user';

@NgModule({
  declarations: [
    UserPage,
  ],
  imports: [
    IonicPageModule.forChild(UserPage),
  ],
})
export class UserPageModule {}
