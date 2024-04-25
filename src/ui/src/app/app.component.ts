import { Component } from "@angular/core";
import { SelectionService } from "./interaction/selection.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Znews";

  constructor(private selService: SelectionService) {}

  onPageClick(e: Event) {
    if (e instanceof PointerEvent)
      this.selService.onPageClickSource.next(e as PointerEvent);
  }
}
