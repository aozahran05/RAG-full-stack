package com.invoiceq.invoice_validator_backend.controller;

import com.invoiceq.invoice_validator_backend.ai.InvoiceAiClient;
import com.invoiceq.invoice_validator_backend.ai.AiExplainRequest;
import com.invoiceq.invoice_validator_backend.dto.ChatStreamToken;
import com.invoiceq.invoice_validator_backend.dto.InvoiceCheckRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class InvoiceChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final InvoiceAiClient invoiceAiClient;

    public InvoiceChatController(SimpMessagingTemplate messagingTemplate, InvoiceAiClient invoiceAiClient) {
        this.messagingTemplate = messagingTemplate;
        this.invoiceAiClient = invoiceAiClient;
    }

    @MessageMapping("/validate-invoice")
    public void validateInvoice(InvoiceCheckRequest request) {

        // 1. Pack the dynamic incoming frontend invoice data
        Map<String, Object> invoiceData = Map.of(
                "invoiceId", request.invoiceId() != null ? request.invoiceId() : "",
                "amount", request.amount() != null ? request.amount() : 0.0,
                "vendorName", request.vendorName() != null ? request.vendorName() : ""
        );

        // 2. Pack the dynamic incoming frontend error data
        Map<String, Object> errorData = Map.of(
                "errorCode", request.errorCode() != null ? request.errorCode() : "",
                "errorMessage", request.errorMessage() != null ? request.errorMessage() : ""
        );

        // 3. Create the AI Request
        AiExplainRequest aiRequest = new AiExplainRequest(
                invoiceData,
                errorData,
                request.query() != null ? request.query() : "Analyze this invoice"
        );

        // 4. Call the Python RAG service and stream the response to Angular
        invoiceAiClient.stream(aiRequest)
                .subscribe(
                        event -> {
                            String token = event.data() != null ? event.data() : "";
                            messagingTemplate.convertAndSend(
                                    "/topic/invoice-stream",
                                    new ChatStreamToken(token, false)
                            );
                        },
                        error -> {
                            messagingTemplate.convertAndSend(
                                    "/topic/invoice-stream",
                                    new ChatStreamToken("\n[Connection to AI failed]", true)
                            );
                        },
                        () -> {
                            messagingTemplate.convertAndSend(
                                    "/topic/invoice-stream",
                                    new ChatStreamToken("", true)
                            );
                        }
                );
    }
}