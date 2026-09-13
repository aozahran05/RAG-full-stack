import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
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
  // @Input allows the parent dashboard to pass the selected invoice data into this widget
  @Input() activeInvoice: any = {
    invoiceId: "INV-2026-991",
    amount: 4500.00,
    vendorName: "Global Tech Supplies",
    errorCode: "VAL-005",
    errorMessage: "Missing tax identification number."
  };

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
      if (this.messages.length === 0 || this.messages[this.messages.length - 1].sender !== 'bot') {
        this.messages.push({ sender: 'bot', text: '', statusText: '', aiText: '' } as any);
      }

      const currentBotMsg: any = this.messages[this.messages.length - 1];

      if (!tokenObj.done) {
        try {
          const parsed = JSON.parse(tokenObj.token);

          if (parsed.message) {
            currentBotMsg.statusText = (currentBotMsg.statusText || '') + `*[${parsed.message}]*\n\n`;
          }
          else if (parsed.text !== undefined) {
            const existingAiText = currentBotMsg.aiText || '';

            if (existingAiText.length > 0 && parsed.text.startsWith(existingAiText)) {
              currentBotMsg.aiText = parsed.text;
            } else {
              currentBotMsg.aiText = existingAiText + parsed.text;
            }
          }
        } catch (e) {
          currentBotMsg.aiText = (currentBotMsg.aiText || '') + tokenObj.token;
        }

        currentBotMsg.text = (currentBotMsg.statusText || '') + (currentBotMsg.aiText || '');
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

    // Format the payload dynamically using the activeInvoice
    const payload = {
      invoiceId: this.activeInvoice?.invoiceId || "",
      amount: this.activeInvoice?.amount || 0,
      vendorName: this.activeInvoice?.vendorName || "",
      errorCode: this.activeInvoice?.errorCode || "",
      errorMessage: this.activeInvoice?.errorMessage || "",
      query: this.userQuery
    };

    this.wsService.sendInvoiceCheck(payload);

    this.userQuery = '';
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
  }
}
