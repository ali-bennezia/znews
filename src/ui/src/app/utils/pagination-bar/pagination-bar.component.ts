import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SearchService } from "src/app/api/search.service";
import { SelectionService } from "src/app/interaction/selection.service";

@Component({
  selector: "app-pagination-bar",
  templateUrl: "./pagination-bar.component.html",
  styleUrls: ["./pagination-bar.component.css"],
})
export class PaginationBarComponent implements OnInit, OnDestroy {
  currentPage: number = 1;

  onPaginationSubscription!: Subscription;

  constructor(
    private searchService: SearchService,
    private selService: SelectionService
  ) {}

  setCurrentPage(i: number) {
    this.currentPage = i;
    this.selService.setPage(i);
  }

  ngOnInit(): void {
    this.onPaginationSubscription = this.selService.onPagination$.subscribe(
      (p) => {
        this.currentPage = p;
      }
    );
    this.setCurrentPage(1);
  }

  ngOnDestroy(): void {
    this.onPaginationSubscription.unsubscribe();
  }
}
