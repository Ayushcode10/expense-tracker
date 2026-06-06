package com.expensetracker.backend.service;

import com.expensetracker.backend.Repository.ExpenseRepository;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.dto.ExpenseRequest;
import com.expensetracker.backend.dto.ExpenseResponse;
import com.expensetracker.backend.dto.SummaryResponse;
import com.expensetracker.backend.model.Expense;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    //Dependency  Injection (Constructor)
    private final ExpenseRepository expenseRepository;

    // -------- GET ALL (with optional filters)---------------------------------------------

    public List<ExpenseResponse> getExpenses(String category, LocalDate from, LocalDate to){
        List<Expense> expenses;

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasDateRange = from != null && to != null;

        if(hasCategory && hasDateRange) {
            expenses = expenseRepository.findByCategoryIgnoreCaseAndDateBetweenOrderByDateDesc(category, from, to);
        } else if (hasCategory) {
            expenses = expenseRepository.findByCategoryIgnoreCaseOrderByDateDesc(category);
        }else if (hasDateRange){
            expenses = expenseRepository.findByDateBetweenOrderByDateDesc(from, to);
        }else{
            expenses = expenseRepository.findAllByOrderByDateDesc();
        }

        return expenses.stream().map(this::toResponse).collect(Collectors.toList());

    }

    //---- CREATE --------------------------------------------------------------------

    public ExpenseResponse createExpense(ExpenseRequest request){
        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .category(request.getCategory().trim())
                .date(request.getDate())
                .note(request.getNote() != null ? request.getNote().trim() : null)
                .build();

        return toResponse(expenseRepository.save(expense));
    }

    //------UPDATE------------------------------------------------------------------------------------

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request){
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Expense not found with id: "+ id));

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory().trim());
        expense.setDate(request.getDate());
        expense.setNote(request.getNote() != null ? request.getNote().trim() : null);

        return toResponse(expenseRepository.save(expense));
    }

    //----DELETE-----------------------------------------------------------------------------

    public void deleteExpense(Long id){
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Expense not found with id: "+ id));

        expenseRepository.deleteById(id);
    }

    //----SUMMARY------------------------------------------------------------------------------

    public SummaryResponse getSummary(Integer month, Integer year) {
        LocalDate now = LocalDate.now();

        // Use provided month/year, fall back to current month/year
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear  = (year  != null) ? year  : now.getYear();

        BigDecimal totalForMonth = expenseRepository
                .sumAmountForMonth(targetMonth, targetYear);

        List<Object[]> categoryTotals = expenseRepository.sumAmountGroupedByCategory();
        Map<String, BigDecimal> totalPerCategory = new LinkedHashMap<>();
        for (Object[] row : categoryTotals) {
            totalPerCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        BigDecimal highestAmount = expenseRepository.findHighestAmount();
        String highestCategory = null;

        List<Expense> highestExpenses = expenseRepository.findExpenseWithHighestAmount();
        if (!highestExpenses.isEmpty()) {
            highestCategory = highestExpenses.get(0).getCategory();
        }

        return SummaryResponse.builder()
                .totalThisMonth(totalForMonth != null ? totalForMonth : BigDecimal.ZERO)
                .totalPerCategory(totalPerCategory)
                .highestExpense(highestAmount != null ? highestAmount : BigDecimal.ZERO)
                .highestExpenseCategory(highestCategory)
                .build();
    }

    //----MAPPER---------------------------------------------------------

    private ExpenseResponse toResponse(Expense expense){
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
