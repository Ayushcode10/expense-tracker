package com.expensetracker.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryResponse {

    // Total spent in the requested month
    private BigDecimal totalThisMonth;

    // All-time totals per category — powers the bar chart and top category card
    private Map<String, BigDecimal> totalPerCategory;

    // ── NEW ──────────────────────────────────────────────────────────────
    // Spending per category for the requested month — powers budget progress bars
    private Map<String, BigDecimal> totalPerCategoryThisMonth;

    private BigDecimal highestExpense;
    private String highestExpenseCategory;
}