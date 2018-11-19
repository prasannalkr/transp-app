import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import  {MatTreeModule } from '@angular/material/tree';
import { AppComponent } from './app.component';
import { MatSelectModule, MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    MatTreeModule,
    FormsModule,
    MatSelectModule, MatButtonModule,
    MatIconModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTooltipModule
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
