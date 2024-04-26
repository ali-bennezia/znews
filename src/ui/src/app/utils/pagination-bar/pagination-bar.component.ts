import { Component } from "@angular/core";
import { SearchService } from "src/app/api/search.service";

@Component({
  selector: "app-pagination-bar",
  templateUrl: "./pagination-bar.component.html",
  styleUrls: ["./pagination-bar.component.css"],
})
export class PaginationBarComponent {
  currentPage: number = 1;

  constructor(private searchService: SearchService) {}

  setCurrentPage(i: number) {
    this.currentPage = i;
    this.searchService.setPage(this.currentPage);
  }
}
