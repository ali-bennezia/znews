import { Component } from "@angular/core";
import { SearchService } from "src/app/api/search.service";

@Component({
  selector: "app-news-list",
  templateUrl: "./news-list.component.html",
  styleUrls: ["./news-list.component.css"],
})
export class NewsListComponent {
  constructor(private searchService: SearchService) {}
}
