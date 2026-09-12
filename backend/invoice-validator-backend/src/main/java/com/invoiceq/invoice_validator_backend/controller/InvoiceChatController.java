package com.invoiceq.invoice_validator_backend.controller;

import com.invoiceq.invoice_validator_backend.dto.ChatStreamToken;
import com.invoiceq.invoice_validator_backend.dto.InvoiceCheckRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.CompletableFuture;

@Controller
public class InvoiceChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public InvoiceChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/validate-invoice")
    public void validateInvoice(InvoiceCheckRequest request) {
        CompletableFuture.runAsync(() -> {
            try {
                String userMessage = request.message() != null ? request.message() : "Hello";
                String sampleResponse = String.format(
                        "Analyzed your query: '%s'. The document details and validation checks look fully verified!",
                        userMessage
                );

                String[] words = sampleResponse.split(" ");
                for (String word : words) {
                    messagingTemplate.convertAndSend(
                            "/topic/invoice-stream",
                            new ChatStreamToken(word + " ", false)
                    );
                    Thread.sleep(120);
                }

                messagingTemplate.convertAndSend(
                        "/topic/invoice-stream",
                        new ChatStreamToken("", true)
                );

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}