import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { WebSocketService } from "./web-socket.service";

import { NewsArticleData } from "./interfaces/news-article-data";
import { MessageData } from "./interfaces/message-data";
import { NetworkData } from "./interfaces/network-data";

import { QuerySortingOptionsData } from "./interfaces/query-sorting-options-data";
import { QueryOptionsData } from "./interfaces/query-options-data";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  news: NewsArticleData[] = [];

  queryOptions: QueryOptionsData = {
    query: "",
    page: 0,
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

  constructor(private wsService: WebSocketService) {
    this.onQuery$.subscribe((qry) => this.onSearchQuery(qry));
    this.wsService.onMessageReceived$.subscribe((dat: NetworkData) => {
      this.onMessageReceived(dat.socket, dat.message);
    });
    this.wsService.onConnected$.subscribe((sck) => {
      this.sendQuery(this.queryOptions);
    });
  }

  onConnected(socket: WebSocket) {}

  onMessageReceived(socket: WebSocket, msg: MessageData) {
    let presentIds = this.news.map((n) => n.id);
    switch (msg.type) {
      case "newsPayload":
        this.news = (msg.content as NewsArticleData[]).filter(
          (n) => !presentIds.includes(n.id)
        );
        break;
      default:
        break;
    }
  }

  sendQuery(qry: QueryOptionsData) {
    this.wsService.sendMessage("query", qry);
  }
  sendCurrentQuery() {
    this.sendQuery(this.queryOptions);
  }

  pushSortingOptions(opts: QuerySortingOptionsData) {
    this.queryOptions.sorting = opts;
    this.sendCurrentQuery();
  }
}
