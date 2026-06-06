package com.expensetracker.backend.Repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByOrderByDateDesc();

    List<Expense> findByCategoryIgnoreCaseOrderByDateDesc(String category);

    List<Expense> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    List<Expense> findByCategoryIgnoreCaseAndDateBetweenOrderByDateDesc(
            String category, LocalDate startDate, LocalDate endDate
    );

    // Total for a specific month
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
            "WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumAmountForMonth(@Param("month") int month, @Param("year") int year);

    // All-time totals per category (used for the chart + top category card)
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e GROUP BY e.category")
    List<Object[]> sumAmountGroupedByCategory();

    // ── NEW ──────────────────────────────────────────────────────────────
    // Monthly totals per category (used for budget progress bars)
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
            "WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year " +
            "GROUP BY e.category")
    List<Object[]> sumAmountGroupedByCategoryForMonth(
            @Param("month") int month, @Param("year") int year
    );

    @Query("SELECT MAX(e.amount) FROM Expense e")
    BigDecimal findHighestAmount();

    @Query("SELECT e FROM Expense e WHERE e.amount = " +
            "(SELECT MAX(e2.amount) FROM Expense e2) ORDER BY e.createdAt DESC")
    List<Expense> findExpenseWithHighestAmount();
}