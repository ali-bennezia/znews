import { Injectable, isDevMode } from "@angular/core";

import cfg from "./../../../../../config/config.json";
import { Observable, Subject } from "rxjs";
import { MessageData } from "./interfaces/message-data";
import { NetworkData } from "./interfaces/network-data";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  onMessageReceivedSource: Subject<NetworkData> = new Subject();
  onMessageReceived$: Observable<NetworkData> =
    this.onMessageReceivedSource.asObservable();

  onConnectedSource: Subject<WebSocket> = new Subject();
  onConnected$: Observable<WebSocket> = this.onConnectedSource.asObservable();

  private wsSocket: WebSocket;
  constructor() {
    this.wsSocket = new WebSocket(
      isDevMode() ? cfg.devBackEndSWUrl : cfg.backEndWSUrl
    );
    this.wsSocket.addEventListener("message", (e: Event) =>
      this.onMessageReceived(e as MessageEvent)
    );
    this.wsSocket.addEventListener("open", (e: Event) => this.onConnected(e));
  }

  sendMessage(type: string, content: any) {
    this.wsSocket.send(JSON.stringify({ type: type, content: content }));
  }

  private onConnected(e: Event) {
    let sck: WebSocket = e.currentTarget as WebSocket;
    this.onConnectedSource.next(sck);
    console.log("Connected!");
  }

  private onMessageReceived(e: MessageEvent) {
    let msg = JSON.parse(e.data);
    console.log(msg);
    this.onMessageReceivedSource.next({
      socket: e.currentTarget as WebSocket,
      message: msg,
    });
  }
}
