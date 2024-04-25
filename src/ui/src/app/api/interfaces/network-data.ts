import { MessageData } from "./message-data";

export interface NetworkData {
  socket: WebSocket;
  message: MessageData;
}
