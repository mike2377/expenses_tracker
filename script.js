/* global localStorage, Chart */
// Load data or empty array if not exists
let transactions = loadTransactions()
let currentFilter = 'all'
let myChart
const CURRENCY = 'FCFA'

// Selecting HTML elements
const form = document.getElementById('transaction-form')
const descInput = document.getElementById('description')
const amountInput = document.getElementById('amount')
const list = document.getElementById('transaction-list')

const balanceEl = document.getElementById('balance')
const incomeEl = document.getElementById('income')
const expenseEl = document.getElementById('expense')

const filterBtns = document.querySelectorAll('.filter-btn')

// Local Storage
function saveTransactions () {
  localStorage.setItem('transactions', JSON.stringify(transactions))
}

function loadTransactions () {
  const data = localStorage.getItem('transactions')
  return data ? JSON.parse(data) : []
}

// Event When form is submitted
form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTransaction()
})

// Event when click on filters
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    // all, income, or expense
    currentFilter = btn.dataset.filter
    renderList()
  })
})

// Add transaction
function addTransaction () {
  const amount = parseFloat(amountInput.value)
  const description = descInput.value.trim()

  // validation
  if (!description) {
    alert('Please enter a description')
    return
  }

  if (Number.isNaN(amount) || amount === 0) {
    alert('please enter a valid amount different from 0')
    return
  }

  // create transaction object
  const transaction = {
    id: crypto.randomUUID(),
    description: descInput.value,
    amount: Math.abs(amount),
    // if amount is positive -> income, negative -> expense
    type: amount >= 0 ? 'income' : 'expense',
    date: new Date().toLocaleDateString('en-US')
  }

  transactions.push(transaction)
  saveTransactions()
  updateUI()
  // clear form
  form.reset()
}

// delete transaction
function deleteTransaction (id) {
  transactions = transactions.filter((t) => t.id !== id)
  saveTransactions()
  updateUI()
}

// Update display
function updateUI () {
  renderSummary()
  renderList()
  renderChart()
}

// display summary (balance, income, expense)
function renderSummary () {
  // sum income and expense amounts
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const balance = income - expense

  // display in HTML
  balanceEl.textContent = `${balance.toFixed(2)} ${CURRENCY}`
  incomeEl.textContent = `+${income.toFixed(2)} ${CURRENCY}`
  expenseEl.textContent = `-${expense.toFixed(2)} ${CURRENCY}`
}

function renderList () {
  // clear the current list
  list.innerHTML = ''

  // Apply filter
  const filtered =
    currentFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === currentFilter)

  // create list items in HTML
  filtered.forEach((t) => {
    const li = document.createElement('li')
    li.className = `transaction ${t.type}`

    const sign = t.type === 'income' ? '+' : '-'

    li.innerHTML = `
            <div class="info">
                <span class="desc"></span>
                <span class="date">${t.date}</span>
            </div>
            <div class="actions">
                <span class="amount">${sign}${t.amount.toFixed(2)} ${CURRENCY}</span>
                <button class="delete-btn">✕</button>
            </div>
        `
    li.querySelector('.desc').textContent = t.description

    // Add delete event on the button
    const deleteBtn = li.querySelector('.delete-btn')
    deleteBtn.addEventListener('click', () => deleteTransaction(t.id))

    list.appendChild(li)
  })
}

function renderChart () {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((a, t) => a + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0)

  const ctx = document.getElementById('mychart').getContext('2d')

  // delete the previous chart if exist
  if (myChart) {
    myChart.destroy()
  }

  // create the chart with Chart.js
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ['#28c76a', '#e74c3c'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  })
}

// Display everything in localStorage at initial load
updateUI()
