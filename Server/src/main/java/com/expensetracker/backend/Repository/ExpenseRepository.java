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

    // All expenses sorted newest first
    List<Expense> findAllByOrderByDateDesc();

    // Filter by category
    List<Expense> findByCategoryIgnoreCaseOrderByDateDesc(String category);

    // Filter by date range
    List<Expense> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    // Filter by category AND date range
    List<Expense> findByCategoryIgnoreCaseAndDateBetweenOrderByDateDesc(
            String category, LocalDate startDate, LocalDate endDate
    );

    // Sum of amounts for current month
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
            "WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumAmountForMonth(@Param("month") int month, @Param("year") int year);

    // Total per category (all time)
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e GROUP BY e.category")
    List<Object[]> sumAmountGroupedByCategory();

    // Highest single expense
    @Query("SELECT MAX(e.amount) FROM Expense e")
    BigDecimal findHighestAmount();

    // Category of highest expense
    @Query("SELECT e FROM Expense e WHERE e.amount = " +
            "(SELECT MAX(e2.amount) FROM Expense e2) ORDER BY e.createdAt DESC")
    List<Expense> findExpenseWithHighestAmount();
}