document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const incomeEl = document.getElementById('income');
    const expensesEl = document.getElementById('expenses');
    const transactionList = document.getElementById('transaction-list');
    const transactionForm = document.getElementById('transaction-form');
    const incomeForm = document.getElementById('income-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categoryInput = document.getElementById('category');
    const categoryFilter = document.getElementById('category-filter');
    const incomeInput = document.getElementById('income-amount');
    const resetButton = document.getElementById('reset-button');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let income = parseFloat(localStorage.getItem('income')) || 0;

    function updateSummary() {
        const expenseAmounts = transactions.map(transaction => transaction.amount);
        const totalExpenses = expenseAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2);

        const totalBalance = (income - totalExpenses).toFixed(2);

        balanceEl.textContent = totalBalance;
        incomeEl.textContent = income.toFixed(2);
        expensesEl.textContent = Math.abs(totalExpenses).toFixed(2);
    }

    function setIncome(e) {
        e.preventDefault();

        income = parseFloat(incomeInput.value.trim());

        if (!isNaN(income) && income > 0) {
            localStorage.setItem('income', income);
            updateSummary();
            incomeInput.value = '';
        }
    }

    function addTransaction(e) {
        e.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value.trim());
        const category = categoryInput.value;

        if (description && !isNaN(amount) && amount > 0) {
            const transaction = {
                id: generateID(),
                description,
                amount: -Math.abs(amount), // Expenses are negative
                category
            };

            transactions.push(transaction);
            addTransactionToDOM(transaction);
            updateSummary();
            saveTransactions();

            descriptionInput.value = '';
            amountInput.value = '';
            categoryInput.value = 'Food'; // Reset to default
        }
    }

    function generateID() {
        return Math.floor(Math.random() * 1000000);
    }

    function addTransactionToDOM(transaction) {
        const item = document.createElement('li');
        item.classList.add('expense');

        item.innerHTML = `
            ${transaction.description} (${transaction.category}) <span>-₹${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
        `;

        transactionList.appendChild(item);
    }

    function removeTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        updateSummary();
        init();
    }

    function editTransaction(id) {
        const transaction = transactions.find(transaction => transaction.id === id);
        if (transaction) {
            descriptionInput.value = transaction.description;
            amountInput.value = Math.abs(transaction.amount); // Show amount as positive for editing
            categoryInput.value = transaction.category;

            removeTransaction(id);
        }
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function filterTransactions() {
        const selectedCategory = categoryFilter.value;
        const filteredTransactions = selectedCategory
            ? transactions.filter(transaction => transaction.category === selectedCategory)
            : transactions;

        transactionList.innerHTML = '';
        filteredTransactions.forEach(addTransactionToDOM);
        updateSummary();
    }

    function resetAll() {
        // Clear local storage
        localStorage.removeItem('transactions');
        localStorage.removeItem('income');

        // Clear variables
        transactions = [];
        income = 0;

        // Clear inputs
        incomeInput.value = '';
        descriptionInput.value = '';
        amountInput.value = '';
        categoryInput.value = 'Food'; // Reset to default

        // Clear displayed data
        balanceEl.textContent = '0.00';
        incomeEl.textContent = '0.00';
        expensesEl.textContent = '0.00';
        transactionList.innerHTML = '';
    }

    categoryFilter.addEventListener('change', filterTransactions);

    function init() {
        transactionList.innerHTML = '';
        transactions.forEach(addTransactionToDOM);
        updateSummary();
    }

    window.removeTransaction = removeTransaction;
    window.editTransaction = editTransaction;

    transactionForm.addEventListener('submit', addTransaction);
    incomeForm.addEventListener('submit', setIncome);
    resetButton.addEventListener('click', resetAll); // Add event listener for reset button
    init();
});
