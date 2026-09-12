import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

export interface ChatToken {
  token: string;
  done: boolean;
}

export interface InvoicePayload {
  invoiceId: string;
  amount: number;
  vendorName: string;
  query: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient!: Client;
  private tokenSubject = new Subject<ChatToken>();

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket(): void {
    this.stompClient = new Client({
      // Connects to the Spring Boot endpoint we created earlier
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-invoice'),
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('[STOMP]:', msg)
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to Spring Boot WebSocket');
      // Listens to the stream coming from the backend
      this.stompClient.subscribe('/topic/invoice-stream', (message: IMessage) => {
        if (message.body) {
          const parsed: ChatToken = JSON.parse(message.body);
          this.tokenSubject.next(parsed);
        }
      });
    };

    this.stompClient.activate();
  }

  public getStreamMessages(): Observable<ChatToken> {
    return this.tokenSubject.asObservable();
  }

  sendMessage(destination: string, payload: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(payload)
      });
    } else {
      console.error('WebSocket connection is not active.');
    }
  }

  public sendInvoiceCheck(payload: InvoicePayload): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/validate-invoice',
        body: JSON.stringify(payload)
      });
    } else {
      console.error('WebSocket connection is not active.');
    }
  }
}
