import { Injectable, isDevMode } from "@angular/core";

import cfg from "./../../../../../config/config.json";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private wsSocket: WebSocket;
  constructor() {
    this.wsSocket = new WebSocket(
      isDevMode() ? cfg.devBackEndWSUrl : cfg.backEndWSUrl
    );
    this.wsSocket.addEventListener("message", this.onMessageReceived);
  }

  onMessageReceived(e: Event) {
    console.log(e);
  }
}
