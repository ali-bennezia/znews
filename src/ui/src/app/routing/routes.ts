import { Routes } from "@angular/router";
import { NewsPageComponent } from "../pages/news-page/news-page.component";
import { AboutPageComponent } from "../pages/about-page/about-page.component";
import { ErrorPageComponent } from "../pages/error-page/error-page.component";

const ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    component: NewsPageComponent,
  },
  {
    path: "news",
    pathMatch: "full",
    redirectTo: "",
  },
  {
    path: "about",
    component: AboutPageComponent,
  },
  {
    path: "**",
    component: ErrorPageComponent,
  },
];
export default ROUTES;
