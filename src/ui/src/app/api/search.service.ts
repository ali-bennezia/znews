import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { WebSocketService } from "./web-socket.service";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  onQuerySource: Subject<string> = new Subject<string>();
  onQuery$: Observable<string> = this.onQuerySource.asObservable().pipe(
    distinctUntilChanged(),
    debounceTime(300),
    switchMap((qry) => {
      return qry;
    })
  );
  //fetchNews$: Observable

  constructor(private wsService: WebSocketService) {}
}
