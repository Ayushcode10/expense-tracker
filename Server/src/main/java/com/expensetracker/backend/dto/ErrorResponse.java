package com.expensetracker.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String ,String> fieldErrors; //for validation failures
}
