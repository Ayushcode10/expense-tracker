package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.*;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.Repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public List<ExpenseResponse> getExpenses(String category, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses;

        boolean hasCategory  = category != null && !category.isBlank();
        boolean hasDateRange = startDate != null && endDate != null;

        if (hasCategory && hasDateRange) {
            expenses = expenseRepository
                    .findByCategoryIgnoreCaseAndDateBetweenOrderByDateDesc(category, startDate, endDate);
        } else if (hasCategory) {
            expenses = expenseRepository.findByCategoryIgnoreCaseOrderByDateDesc(category);
        } else if (hasDateRange) {
            expenses = expenseRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
        } else {
            expenses = expenseRepository.findAllByOrderByDateDesc();
        }

        return expenses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .category(request.getCategory().trim())
                .date(request.getDate())
                .note(request.getNote() != null ? request.getNote().trim() : null)
                .build();
        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory().trim());
        expense.setDate(request.getDate());
        expense.setNote(request.getNote() != null ? request.getNote().trim() : null);

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    public SummaryResponse getSummary(Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear  = (year  != null) ? year  : now.getYear();

        // ── Total for selected month ──────────────────────────────────────
        BigDecimal totalForMonth = expenseRepository
                .sumAmountForMonth(targetMonth, targetYear);

        // ── All-time totals per category (chart + top category card) ──────
        Map<String, BigDecimal> totalPerCategory = new LinkedHashMap<>();
        for (Object[] row : expenseRepository.sumAmountGroupedByCategory()) {
            totalPerCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        // ── Monthly totals per category (budget progress bars) ────────────
        Map<String, BigDecimal> totalPerCategoryThisMonth = new LinkedHashMap<>();
        for (Object[] row : expenseRepository
                .sumAmountGroupedByCategoryForMonth(targetMonth, targetYear)) {
            totalPerCategoryThisMonth.put((String) row[0], (BigDecimal) row[1]);
        }

        // ── Highest single expense (all-time) ─────────────────────────────
        BigDecimal highestAmount = expenseRepository.findHighestAmount();
        String highestCategory  = null;
        List<Expense> highestExpenses = expenseRepository.findExpenseWithHighestAmount();
        if (!highestExpenses.isEmpty()) {
            highestCategory = highestExpenses.get(0).getCategory();
        }

        return SummaryResponse.builder()
                .totalThisMonth(totalForMonth != null ? totalForMonth : BigDecimal.ZERO)
                .totalPerCategory(totalPerCategory)
                .totalPerCategoryThisMonth(totalPerCategoryThisMonth)
                .highestExpense(highestAmount != null ? highestAmount : BigDecimal.ZERO)
                .highestExpenseCategory(highestCategory)
                .build();
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .date(expense.getDate())
                .note(expense.getNote())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}