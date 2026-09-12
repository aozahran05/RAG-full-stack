package com.invoiceq.invoice_validator_backend.dto;

import java.math.BigDecimal;

public record InvoiceCheckRequest(
        String message
) {}