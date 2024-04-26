import { Component, HostListener } from "@angular/core";
import { SelectionService } from "./interaction/selection.service";
import { SearchService } from "./api/search.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Znews";

  constructor(
    private selService: SelectionService,
    private serService: SearchService
  ) {}

  onPageClick(e: Event) {
    if (e instanceof PointerEvent)
      this.selService.onPageClickSource.next(e as PointerEvent);
  }
}
