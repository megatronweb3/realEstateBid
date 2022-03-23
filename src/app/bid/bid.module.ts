import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BidComponent} from './bid.component';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
//import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule, 
  MatSnackBarModule,  
  MatRadioModule,   
  MatCheckboxModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatRadioModule,
    MatCheckboxModule,
    RouterModule,
    UtilModule
    //,AngularFontAwesomeModule
  ],
  declarations: [BidComponent],
  exports: [BidComponent]
})
export class BidModule {
}
