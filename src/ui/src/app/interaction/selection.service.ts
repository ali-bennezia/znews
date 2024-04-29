import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SelectionService {
  onPageClickSource: Subject<PointerEvent> = new Subject();
  onPageClick$: Observable<PointerEvent> =
    this.onPageClickSource.asObservable();

  onPaginationSource: Subject<number> = new Subject();
  onPagination$: Observable<number> = this.onPaginationSource.asObservable();

  setPage(i: number) {
    this.onPaginationSource.next(i);
  }

  constructor() {}
}
