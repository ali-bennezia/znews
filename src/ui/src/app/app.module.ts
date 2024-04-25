import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { NewsPageComponent } from "./pages/news-page/news-page.component";
import { AboutPageComponent } from "./pages/about-page/about-page.component";
import { NavbarComponent } from "./layout/navbar/navbar.component";
import { AppRouterModule } from "./routing/app-router/app-router.module";
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { NewsListComponent } from './display/news/news-list/news-list.component';
import { NewsComponent } from './display/news/news/news.component';

@NgModule({
  declarations: [
    AppComponent,
    NewsPageComponent,
    AboutPageComponent,
    NavbarComponent,
    ErrorPageComponent,
    NewsListComponent,
    NewsComponent,
  ],
  imports: [BrowserModule, AppRouterModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
