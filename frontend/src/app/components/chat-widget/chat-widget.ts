import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../websocket';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})

export class ChatWidgetComponent implements OnInit, OnDestroy {
  userQuery: string = '';
  isOpen: boolean = false;
  isStreaming: boolean = false;
  messages: Array<{ sender: string, text: string }> = [];
  private messageSub!: Subscription;

  constructor(
    private wsService: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.messageSub = this.wsService.getStreamMessages().subscribe((tokenObj: any) => {
      // Create a new bot message bubble if one doesn't exist yet for this response stream
      if (this.messages.length === 0 || this.messages[this.messages.length - 1].sender !== 'bot') {
        this.messages.push({ sender: 'bot', text: '' });
      }

      const currentBotMsg = this.messages[this.messages.length - 1];

      if (!tokenObj.done) {
        currentBotMsg.text += tokenObj.token;
        this.isStreaming = true;
      } else {
        this.isStreaming = false;
      }

      this.cdr.detectChanges();
    });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  submitCheck(): void {
    if (!this.userQuery.trim()) return;

    this.messages.push({ sender: 'user', text: this.userQuery });
    this.wsService.sendMessage('/app/validate-invoice', { message: this.userQuery });

    this.userQuery = '';
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
  }
}
