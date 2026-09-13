package com.invoiceq.invoice_validator_backend.dto;

public record InvoiceCheckRequest(
        String invoiceId,
        Double amount,
        String vendorName,
        String errorCode,
        String errorMessage,
        String query
) {}