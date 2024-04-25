import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SelectionService {
  onPageClickSource: Subject<PointerEvent> = new Subject();
  onPageClick$ = this.onPageClickSource.asObservable();

  constructor() {}
}
