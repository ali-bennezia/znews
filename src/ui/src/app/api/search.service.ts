import { Injectable } from "@angular/core";

import { Observable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { WebSocketService } from "./web-socket.service";

import { NewsArticleData } from "./interfaces/news-article-data";
import { MessageData } from "./interfaces/message-data";
import { NetworkData } from "./interfaces/network-data";

import { QuerySortingOptionsData } from "./interfaces/query-sorting-options-data";
import { QueryOptionsData } from "./interfaces/query-options-data";
import { query } from "@angular/animations";
import { SelectionService } from "../interaction/selection.service";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  news: NewsArticleData[] = [];

  queryOptions: QueryOptionsData = {
    query: "",
    page: 1,
  };

  emitSearchQuery(qry: string) {
    this.queryOptions.query = qry;
    this.onQuerySource.next(qry);
  }

  onSearchQuery(qry: string) {
    this.sendCurrentQuery();
  }

  setPage(val: number) {
    this.queryOptions.page = val;

    this.sendCurrentQuery();
  }

  onQuerySource: Subject<string> = new Subject<string>();
  onQuery$: Observable<string> = this.onQuerySource
    .asObservable()
    .pipe(distinctUntilChanged(), debounceTime(300));

  constructor(
    private wsService: WebSocketService,
    private selService: SelectionService
  ) {
    this.onQuery$.subscribe((qry) => {
      this.selService.setPage(1);
      this.onSearchQuery(qry);
    });
    this.wsService.onMessageReceived$.subscribe((dat: NetworkData) => {
      this.onMessageReceived(dat.socket, dat.message);
    });
    this.wsService.onConnected$.subscribe((sck) => {
      this.sendQuery(this.queryOptions);
    });
    this.selService.onPagination$.subscribe((p) => {
      this.setPage(p);
    });
  }

  onConnected(socket: WebSocket) {}

  onMessageReceived(socket: WebSocket, msg: MessageData) {
    //let presentIds = this.news.map((n) => n.id);
    switch (msg.type) {
      case "newsPayload":
        this.news = msg.content as NewsArticleData[]; /*.filter(
          (n) => !presentIds.includes(n.id)
        );*/
        break;
      default:
        break;
    }
  }

  sendQuery(qry: QueryOptionsData) {
    this.wsService.sendMessage("query", qry);
    console.log(qry);
  }
  sendCurrentQuery() {
    this.sendQuery(this.queryOptions);
  }

  pushSortingOptions(opts: QuerySortingOptionsData) {
    this.queryOptions.sorting = opts;
    console.log(this.queryOptions);
    this.sendCurrentQuery();
  }
}
