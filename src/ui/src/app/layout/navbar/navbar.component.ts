import { Component } from "@angular/core";
import { SearchService } from "src/app/api/search.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
  showMobileMenu: boolean = false;

  constructor(public searchService: SearchService) {}

  onInput(inp: string) {
    this.searchService.emitSearchQuery(inp);
  }
}
