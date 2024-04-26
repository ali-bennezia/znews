import { Component } from "@angular/core";
import { QuerySortingOptionsData } from "src/app/api/interfaces/query-sorting-options-data";
import { SearchService } from "src/app/api/search.service";

@Component({
  selector: "app-sort-menu",
  templateUrl: "./sort-menu.component.html",
  styleUrls: ["./sort-menu.component.css"],
})
export class SortMenuComponent {
  sortingOptions: QuerySortingOptionsData = {
    sortBy: "createdAt",
    sortOrder: 1,
  };

  constructor(private searchService: SearchService) {}
  onSortByChanged(val: string) {
    this.sortingOptions.sortBy = val;
    this.searchService.pushSortingOptions(this.sortingOptions);
  }
  onOrderByChanged(val: string) {
    let num = Number(val);
    this.sortingOptions.sortOrder = num;
    this.searchService.pushSortingOptions(this.sortingOptions);
  }
}
