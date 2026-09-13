import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title: string = 'frontend';

  selectedInvoiceFromTable: any = {
    invoiceId: "INV-2026-991",
    amount: 4500.00,
    vendorName: "Global Tech Supplies",
    errorCode: "VAL-005",
    errorMessage: "Missing tax identification number."
  };

  onInvoiceRowClick(clickedInvoice: any) {
    this.selectedInvoiceFromTable = clickedInvoice;
  }
}
