// Formats a number as Indian Rupees — adjust locale/currency as needed
export const formatCurrency = (amount) => {
  if (amount == null) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

// "2025-06-01" → "1 Jun 2025"
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Returns today's date as "YYYY-MM-DD" for date input default values
export const todayISO = () => new Date().toISOString().split("T")[0];

// Returns first day of current month as "YYYY-MM-DD"
export const firstOfMonthISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};