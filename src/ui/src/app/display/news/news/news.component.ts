import { Component, Input, isDevMode } from "@angular/core";
import { NewsArticleData } from "src/app/api/interfaces/news-article-data";
import cfg from "./../../../../../../../config/config.json";

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrls: ["./news.component.css"],
})
export class NewsComponent {
  @Input()
  news!: NewsArticleData;

  getImageURLPrefix() {
    return isDevMode() ? cfg.devBackEndHttpUrl : cfg.backEndHttpUrl;
  }
}
