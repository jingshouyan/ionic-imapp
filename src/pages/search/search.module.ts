import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular/umd';
import { SearchPage } from './search';

@NgModule({
  declarations: [
    SearchPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchPage),
  ],
})
export class SearchPageModule {}
