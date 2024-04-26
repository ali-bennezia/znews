import { Injectable } from "@angular/core";

import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { WebSocketService } from "./web-socket.service";

import { NewsArticleData } from "./interfaces/news-article-data";
import { MessageData } from "./interfaces/message-data";
import { NetworkData } from "./interfaces/network-data";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  news: NewsArticleData[] = [];

  onQuerySource: Subject<string> = new Subject<string>();
  onQuery$: Observable<string> = this.onQuerySource
    .asObservable()
    .pipe(distinctUntilChanged(), debounceTime(300));
  //fetchNews$: Observable

  constructor(private wsService: WebSocketService) {
    this.wsService.onMessageReceived$.subscribe((dat: NetworkData) => {
      this.onMessageReceived(dat.socket, dat.message);
    });
    this.wsService.onConnected$.subscribe((sck) => {
      this.wsService.sendMessage("query", {});
    });
  }

  onConnected(socket: WebSocket) {}

  onMessageReceived(socket: WebSocket, msg: MessageData) {
    this.news = msg.content as NewsArticleData[];
  }
}
