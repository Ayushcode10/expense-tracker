package com.expensetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SummaryResponse {
    private BigDecimal totalThisMonth;
    private Map<String,BigDecimal> totalPerCategory;
    private BigDecimal highestExpense;
    private String highestExpenseCategory;
}
