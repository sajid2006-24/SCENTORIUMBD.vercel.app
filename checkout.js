
// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
  loadOrderSummary();
  setupFormValidation();
  setupPaymentMethods();
});

// Load cart data from localStorage or URL params
function loadOrderSummary() {
  // Get cart data from localStorage (you might want to use sessionStorage or pass data differently)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // If no cart data, try to get from the previous page (simplified approach)
  if (cart.length === 0) {
    // Show empty cart message
    showEmptyCart();
    return;
  }
  
  displayOrderItems(cart);
  calculateTotals(cart);
}

function showEmptyCart() {
  const container = document.querySelector('.checkout-container');
  container.innerHTML = `
    <div class="empty-checkout">
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added any items to your cart yet.</p>
      <a href="index.html" class="continue-shopping">Continue Shopping</a>
    </div>
  `;
}

function displayOrderItems(cart) {
  const orderItems = document.getElementById('orderItems');
  orderItems.innerHTML = '';
  
  cart.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>Quantity: ${item.quantity}</p>
      </div>
      <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    `;
    orderItems.appendChild(orderItem);
  });
}

function calculateTotals(cart) {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + shipping + tax;
  
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

function setupFormValidation() {
  const form = document.getElementById('checkoutForm');
  
  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = value;
    });
  }
  
  // Expiry date formatting
  const expiry = document.getElementById('expiry');
  if (expiry) {
    expiry.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
  
  // CVV validation
  const cvv = document.getElementById('cvv');
  if (cvv) {
    cvv.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm()) {
        processOrder();
      }
    });
  }
}

function setupPaymentMethods() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('cardDetails');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      if (this.value === 'card') {
        cardDetails.style.display = 'block';
        setCardFieldsRequired(true);
      } else {
        cardDetails.style.display = 'none';
        setCardFieldsRequired(false);
      }
    });
  });
}

function setCardFieldsRequired(required) {
  const cardFields = ['cardNumber', 'cardName', 'expiry', 'cvv'];
  cardFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.required = required;
    }
  });
}

function validateForm() {
  const form = document.getElementById('checkoutForm');
  const formData = new FormData(form);
  
  // Basic validation
  const requiredFields = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#e74c3c';
      isValid = false;
    } else {
      field.style.borderColor = '#ddd';
    }
  });
  
  // Email validation
  const email = document.getElementById('email');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email.value)) {
    email.style.borderColor = '#e74c3c';
    isValid = false;
  }
  
  // Card number validation (if card payment selected)
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (paymentMethod && paymentMethod.value === 'card') {
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber && cardNumber.value.replace(/\s/g, '').length < 13) {
      cardNumber.style.borderColor = '#e74c3c';
      isValid = false;
    }
  }
  
  if (!isValid) {
    alert('Please fill in all required fields correctly.');
  }
  
  return isValid;
}

function processOrder() {
  // Show loading state
  const submitBtn = document.querySelector('.place-order-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Processing...';
  submitBtn.disabled = true;
  
  // Simulate order processing
  setTimeout(() => {
    // Clear cart
    localStorage.removeItem('cart');
    
    // Redirect to success page or show success message
    alert('Order placed successfully! You will receive a confirmation email shortly.');
    window.location.href = 'index.html';
  }, 2000);
}

// Store cart data in localStorage when coming from main page
function storeCartData(cartData) {
  localStorage.setItem('cart', JSON.stringify(cartData));
}
