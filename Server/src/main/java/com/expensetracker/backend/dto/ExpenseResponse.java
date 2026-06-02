package com.expensetracker.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseResponse {
    private long id;
    private BigDecimal amount;
    private String category;
    private LocalDate date;
    private String note;
    private LocalDateTime createdAt;
}
