
// =====================================
// SPENDWISE APPLICATION
// =====================================


// 1. DEFAULT BUDGET

const DEFAULT_BUDGET = 50000;


// 2. LOCAL STORAGE KEYS

const STORAGE_KEYS = {
    budget: "spendwise-budget",
    expenses: "spendwise-expenses"
};


// 3. APPLICATION VARIABLES

let budget =
    Number(localStorage.getItem(STORAGE_KEYS.budget))
    || DEFAULT_BUDGET;


// Load saved expenses

let expenses = loadExpenses();


// 4. SELECT HTML ELEMENTS

const budgetDisplay =
    document.getElementById("budget-display");

const spentDisplay =
    document.getElementById("spent-display");

const remainingDisplay =
    document.getElementById("remaining-display");

const remainingHint =
    document.getElementById("remaining-hint");

const expenseList =
    document.getElementById("expense-list");

const budgetProgress =
    document.getElementById("budget-progress");

const budgetPercent =
    document.getElementById("budget-percent");

const budgetMessage =
    document.getElementById("budget-message");

const toast =
    document.getElementById("toast");


// =====================================
// 5. LOAD EXPENSES
// =====================================

function loadExpenses() {

    try {

        const savedExpenses =
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.expenses)
            );

        return Array.isArray(savedExpenses)
            ? savedExpenses
            : [];

    } catch (error) {

        return [];

    }

}


// =====================================
// 6. SAVE INFORMATION
// =====================================

function saveData() {

    localStorage.setItem(
        STORAGE_KEYS.budget,
        String(budget)
    );

    localStorage.setItem(
        STORAGE_KEYS.expenses,
        JSON.stringify(expenses)
    );

}


// =====================================
// 7. FORMAT MONEY
// =====================================

function formatMoney(amount) {

    return new Intl.NumberFormat("en-KE", {

        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0

    }).format(amount);

}


// =====================================
// 8. SHOW NOTIFICATION
// =====================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    window.setTimeout(() => {

        toast.classList.remove("show");

    }, 2400);

}


// =====================================
// 9. UPDATE DASHBOARD
// =====================================

function updateDashboard() {

    // Calculate total expenses using reduce()

    const totalSpent = expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );


    // Calculate remaining money

    const remaining = budget - totalSpent;


    // Calculate percentage

    const percentage = budget > 0
        ? Math.round((totalSpent / budget) * 100)
        : 0;


    // Update summary cards

    budgetDisplay.textContent =
        formatMoney(budget);

    spentDisplay.textContent =
        formatMoney(totalSpent);

    remainingDisplay.textContent =
        formatMoney(remaining);


    // Check remaining budget

    if (remaining < 0) {

        remainingHint.textContent =
            "You are over budget";

    } else {

        remainingHint.textContent =
            "Available to spend";

    }


    // Update progress bar

    budgetPercent.textContent =
        percentage + "%";

    budgetProgress.style.width =
        Math.min(percentage, 100) + "%";


    // CONDITIONAL STATEMENTS

    if (totalSpent > budget) {

        budgetMessage.textContent =
            "You are over your budget. Review your spending.";

        budgetMessage.style.color = "#c45d5d";

        budgetProgress.style.background =
            "#c45d5d";

    }

    else if (percentage >= 80) {

        budgetMessage.textContent =
            "You have used most of your budget. Spend carefully.";

        budgetMessage.style.color = "#bd842c";

        budgetProgress.style.background =
            "#d99b3d";

    }

    else {

        budgetMessage.textContent =
            "You are within your budget. Keep it up!";

        budgetMessage.style.color = "";

        budgetProgress.style.background = "";

    }


    // Update transaction table

    renderExpenses();


    // Save all information

    saveData();

}


// =====================================
// 10. DISPLAY EXPENSES
// =====================================

function renderExpenses() {

    expenseList.innerHTML = "";


    // Check whether there are expenses

    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <tr class="empty-row">

                <td colspan="5">

                    No expenses yet.
                    Add your first expense above.

                </td>

            </tr>
        `;

        return;

    }


    // LOOP THROUGH EXPENSE ARRAY

    expenses.forEach((expense) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${escapeHTML(expense.name)}</td>

            <td>
                <span class="category-tag">
                    ${escapeHTML(expense.category)}
                </span>
            </td>

            <td>${escapeHTML(expense.date)}</td>

            <td>
                ${formatMoney(expense.amount)}
            </td>

            <td>

                <button
                    class="delete-button"
                    type="button"
                    data-id="${expense.id}"
                >

                    Delete

                </button>

            </td>

        `;

        expenseList.appendChild(row);

    });

}


// =====================================
// 11. PROTECT USER INPUT
// =====================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, (character) => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}


// =====================================
// 12. UPDATE MONTHLY BUDGET
// =====================================

document
    .getElementById("budget-form")
    .addEventListener("submit", (event) => {

        event.preventDefault();


        const newBudget = Number(
            document.getElementById("budget-input").value
        );


        // Validate budget

        if (
            !Number.isFinite(newBudget)
            || newBudget <= 0
        ) {

            showToast(
                "Enter a budget greater than zero."
            );

            return;

        }


        budget = newBudget;


        document.getElementById("budget-input").value = "";


        updateDashboard();


        showToast(
            "Your budget has been updated."
        );

    });


// =====================================
// 13. ADD NEW EXPENSE
// =====================================

document
    .getElementById("expense-form")
    .addEventListener("submit", (event) => {

        event.preventDefault();


        // Get information from form

        const name =
            document.getElementById("expense-name")
            .value.trim();

        const category =
            document.getElementById("expense-category")
            .value;

        const amount =
            Number(
                document.getElementById("expense-amount").value
            );

        const date =
            document.getElementById("expense-date").value;


        // Validate information

        if (
            !name ||
            !category ||
            !date ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showToast(
                "Please complete all fields correctly."
            );

            return;

        }


        // CREATE NEW EXPENSE OBJECT

        const newExpense = {

            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,

            name: name,

            category: category,

            amount: amount,

            date: date

        };


        // ADD EXPENSE TO ARRAY

        expenses.unshift(newExpense);


        // Clear form

        event.target.reset();


        // Set today's date

        document.getElementById("expense-date")
            .valueAsDate = new Date();


        // Update dashboard

        updateDashboard();


        showToast(
            "Expense added successfully."
        );

    });


// =====================================
// 14. DELETE INDIVIDUAL EXPENSE
// =====================================

expenseList.addEventListener("click", (event) => {

    const deleteButton =
        event.target.closest(".delete-button");


    if (!deleteButton) {

        return;

    }


    const expenseId =
        deleteButton.dataset.id;


    // FILTER OUT THE SELECTED EXPENSE

    expenses = expenses.filter(
        (expense) => expense.id !== expenseId
    );


    updateDashboard();


    showToast(
        "Expense deleted."
    );

});


// =====================================
// 15. CLEAR ALL EXPENSES
// =====================================

document
    .getElementById("clear-expenses")
    .addEventListener("click", () => {


        if (expenses.length === 0) {

            showToast(
                "There are no expenses to clear."
            );

            return;

        }


        const confirmed = window.confirm(
            "Are you sure you want to delete all expenses?"
        );


        if (confirmed) {

            expenses = [];

            updateDashboard();

            showToast(
                "All expenses have been cleared."
            );

        }

    });


// =====================================
// 16. DISPLAY CURRENT DATE
// =====================================

const today = new Date();


document.getElementById("expense-date")
    .valueAsDate = today;


document.getElementById("today-date")
    .textContent = today.toLocaleDateString(
        "en-KE",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );


document.getElementById("current-month")
    .textContent = today.toLocaleDateString(
        "en-KE",
        {
            month: "long",
            year: "numeric"
        }
    );


document.getElementById("year")
    .textContent = today.getFullYear();


// =====================================
// 17. START APPLICATION
// =====================================

updateDashboard();
