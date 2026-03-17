let currentCustomer = null;
let transactions = [];

// Load from localStorage if exists
function loadData() {
  const saved = localStorage.getItem('waterpage_customers');
  if (saved) {
    const customers = JSON.parse(saved);
    if (customers.length > 0) {
      currentCustomer = customers[0]; // For simplicity – later make list
      transactions = currentCustomer.transactions || [];
      showCustomerView();
    }
  }
}

function saveData() {
  if (currentCustomer) {
    currentCustomer.transactions = transactions;
    localStorage.setItem('waterpage_customers', JSON.stringify([currentCustomer]));
  }
}

function createCustomer() {
  const name = document.getElementById('new-name').value.trim();
  const phone = document.getElementById('new-phone').value.trim();
  const units = parseFloat(document.getElementById('initial-units').value) || 0;
  
  if (!name || units <= 0) {
    alert('Enter name and valid units!');
    return;
  }
  
  currentCustomer = { name, phone, totalPrepaid: units, balance: units };
  transactions = [{
    type: 'credit',
    amount: units,
    timestamp: new Date().toISOString(),
    balanceAfter: units,
    note: 'Initial prepaid'
  }];
  
  saveData();
  showCustomerView();
}

function showCustomerView() {
  document.getElementById('add-customer').style.display = 'none';
  document.getElementById('customer-view').style.display = 'block';
  document.getElementById('customer-name').textContent = currentCustomer.name;
  updateBalance();
  renderHistory();
}

function updateBalance() {
  const bal = transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : currentCustomer.balance;
  document.getElementById('balance').textContent = bal.toFixed(0) + ' units';
}

function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  transactions.slice().reverse().forEach(tx => { // newest first
    const li = document.createElement('li');
    const date = new Date(tx.timestamp);
    const timeStr = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    li.innerHTML = `
      <strong>${tx.type === 'credit' ? 'Paid' : 'Collected'}</strong> ${tx.amount} units<br>
      <small>${dayStr} ${timeStr} • Balance: ${tx.balanceAfter}</small><br>
      <small>${tx.note || ''}</small>
    `;
    li.className = tx.type === 'credit' ? 'credit' : 'debit';
    list.appendChild(li);
  });
}

function addPayment() {
  const amount = prompt(`How many units prepaid? `);
  const num = parseFloat(amount);
  if (!num || num <= 0) return;
  
  const lastBal = transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : currentCustomer.balance;
  const newBal = lastBal + num;
  
  transactions.push({
    type: 'credit',
    amount: num,
    timestamp: new Date().toISOString(),
    balanceAfter: newBal,
    note: 'Prepaid payment'
  });
  
  saveData();
  updateBalance();
  renderHistory();
}

function recordCollection() {
  const amount = prompt('How many units collected?');
  const num = parseFloat(amount);
  if (!num || num <= 0) return;
  
  const lastBal = transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : currentCustomer.balance;
  if (num > lastBal) {
    alert('Not enough balance!');
    return;
  }
  
  const newBal = lastBal - num;
  
  transactions.push({
    type: 'debit',
    amount: num,
    timestamp: new Date().toISOString(),
    balanceAfter: newBal,
    note: 'Water collection'
  });
  
  saveData();
  updateBalance();
  renderHistory();
}

// Start app
loadData();
if (currentCustomer) showCustomerView();

// Add reset functionality
document.getElementById('reset-btn').addEventListener('click', function() {
  if (confirm("This will clear the current customer and all their transactions. Continue?")) {
    localStorage.removeItem('waterpage_customers');
    currentCustomer = null;
    transactions = [];
    
    // Hide customer view, show add-customer form again
    document.getElementById('customer-view').style.display = 'none';
    document.getElementById('add-customer').style.display = 'block';
    
    // Clear the input fields too
    document.getElementById('new-name').value = '';
    document.getElementById('new-phone').value = '';
    document.getElementById('initial-units').value = '';
    
    alert("Ready for a new customer! Fill in the details below.");
  }
});