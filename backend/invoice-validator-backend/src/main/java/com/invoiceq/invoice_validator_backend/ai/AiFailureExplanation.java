package com.invoiceq.invoice_validator_backend.ai;

import java.util.List;

public record AiFailureExplanation(
        String summary,
        String likelyCause,
        List<String> affectedFields,
        List<String> recommendedChanges,
        List<String> supportingRules,
        String confidence,
        boolean needsMoreInformation
) {
}
