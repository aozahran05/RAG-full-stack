package com.invoiceq.invoice_validator_backend.dto;

public record ChatStreamToken(
        String token,
        boolean done
) {}