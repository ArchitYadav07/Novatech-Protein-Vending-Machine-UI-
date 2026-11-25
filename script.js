const flavors = [
    { id: 'whey-vanilla', name: 'Whey Isolate', desc: 'Vanilla Ice Cream', icon: '🍦' },
    { id: 'whey-choco', name: 'Whey Isolate', desc: 'Double Chocolate', icon: '🍫' },
    { id: 'pre-berry', name: 'Pre-Workout', desc: 'Mixed Berry Blast', icon: '🍓' },
    { id: 'pre-citrus', name: 'Pre-Workout', desc: 'Citrus Surge', icon: '🍋' },
    { id: 'bcaa', name: 'BCAA Recovery', desc: 'Watermelon Splash', icon: '🍉' },
    { id: 'vegan', name: 'Vegan Protein', desc: 'Smooth Peanut Butter', icon: '🥜' }
];

let currentSelection = {
    flavor: null,
    dose: null,
    glasses: 1
};

let cart = [];

// DOM Elements
const flavorGrid = document.getElementById('flavor-grid');
const doseBtns = document.querySelectorAll('.dose-btn');
const glassesCountEl = document.getElementById('glasses-count');
const decreaseBtn = document.getElementById('decrease-glasses');
const increaseBtn = document.getElementById('increase-glasses');
const addToCartBtn = document.getElementById('add-to-cart');
const cartItemsContainer = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentModal = document.getElementById('payment-modal');
const dispensingModal = document.getElementById('dispensing-modal');
const totalAmountDisplay = document.getElementById('total-amount-display');
const paymentBtns = document.querySelectorAll('.payment-btn');
const qrContainer = document.getElementById('qr-container');
const cancelPaymentBtn = document.getElementById('cancel-payment-btn');

// Base Prices (Example)
const BASE_PRICE = 50; // $0.50 per 10g roughly, so 40g = 200

// Initialize
function init() {
    renderFlavors();
    setupEventListeners();
    updateUI();
}

function renderFlavors() {
    flavors.forEach(flavor => {
        const btn = document.createElement('button');
        btn.className = 'option-btn flavor-btn';
        btn.dataset.id = flavor.id;
        btn.innerHTML = `
            <span class="flavor-icon">${flavor.icon}</span>
            ${flavor.name}
            <span>${flavor.desc}</span>
        `;
        btn.addEventListener('click', () => selectFlavor(flavor));
        flavorGrid.appendChild(btn);
    });
}

function setupEventListeners() {
    doseBtns.forEach(btn => {
        btn.addEventListener('click', () => selectDose(btn.dataset.value));
    });

    decreaseBtn.addEventListener('click', () => {
        if (currentSelection.glasses > 1) {
            currentSelection.glasses--;
            updateUI();
        }
    });

    increaseBtn.addEventListener('click', () => {
        if (currentSelection.glasses < 5) { // Max 5 glasses at once
            currentSelection.glasses++;
            updateUI();
        }
    });

    addToCartBtn.addEventListener('click', addToCart);
    
    checkoutBtn.addEventListener('click', openPaymentModal);
    
    cancelPaymentBtn.addEventListener('click', closePaymentModal);
    
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => processPayment(btn.dataset.method));
    });
}

function selectFlavor(flavor) {
    currentSelection.flavor = flavor;
    
    // Update visual selection
    document.querySelectorAll('.flavor-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.id === flavor.id);
    });
    
    updateUI();
}

function selectDose(doseValue) {
    currentSelection.dose = doseValue;
    
    // Update visual selection
    doseBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === doseValue);
    });
    
    updateUI();
}

function updateUI() {
    glassesCountEl.textContent = currentSelection.glasses;
    
    // Enable/disable add to cart button
    const canAdd = currentSelection.flavor !== null && currentSelection.dose !== null;
    addToCartBtn.disabled = !canAdd;
    
    if (canAdd) {
        addToCartBtn.classList.add('ready');
        addToCartBtn.style.background = 'var(--primary)';
        addToCartBtn.style.color = '#000';
    } else {
        addToCartBtn.style.background = '';
        addToCartBtn.style.color = '';
    }

    // Enable/disable checkout
    checkoutBtn.disabled = cart.length === 0;
}

function addToCart() {
    if (!currentSelection.flavor || !currentSelection.dose) return;

    const newItem = {
        id: Date.now(),
        flavor: currentSelection.flavor,
        dose: currentSelection.dose,
        glasses: currentSelection.glasses
    };

    cart.push(newItem);
    renderCart();
    resetSelection();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
    updateUI();
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your order is empty. Fuel up!</p>';
        updateUI();
        return;
    }

    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="item-details">
                <h4>${item.glasses}x ${item.flavor.name}</h4>
                <p>${item.flavor.desc} | ${item.dose}g dose per glass</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        cartItemsContainer.appendChild(el);
    });
    
    updateUI();
}

function resetSelection() {
    currentSelection = { flavor: null, dose: null, glasses: 1 };
    
    document.querySelectorAll('.flavor-btn, .dose-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateUI();
}

// -- Payment Logic --
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        // Mock calculation: $0.05 per gram
        const itemPrice = (item.dose * 0.05) * item.glasses;
        total += itemPrice;
    });
    return total;
}

function openPaymentModal() {
    if (cart.length === 0) return;
    const total = calculateTotal();
    totalAmountDisplay.textContent = `$${total.toFixed(2)}`;
    
    qrContainer.classList.add('hidden');
    document.querySelector('.payment-options').classList.remove('hidden');
    
    paymentModal.classList.remove('hidden');
}

function closePaymentModal() {
    paymentModal.classList.add('hidden');
    qrContainer.classList.add('hidden');
    document.querySelector('.payment-options').classList.remove('hidden');
}

function processPayment(method) {
    document.querySelector('.payment-options').classList.add('hidden');
    qrContainer.classList.remove('hidden');
    
    if (method === 'qr') {
        qrContainer.querySelector('.qr-placeholder').innerHTML = '📱<br><br>Scan with UPI app<br>(Mock QR)';
    } else if (method === 'nfc') {
        qrContainer.querySelector('.qr-placeholder').innerHTML = '📶<br><br>Tap Phone or Card';
    } else {
        qrContainer.querySelector('.qr-placeholder').innerHTML = '💳<br><br>Insert Card';
    }

    // Simulate payment processing time
    setTimeout(() => {
        closePaymentModal();
        dispense();
    }, 3500);
}

function dispense() {
    if (cart.length === 0) return;
    
    // Show modal
    dispensingModal.classList.remove('hidden');
    
    // Simulate dispensing process
    setTimeout(() => {
        dispensingModal.classList.add('hidden');
        cart = [];
        renderCart();
        alert("Dispensing complete! Enjoy your peak performance fuel.");
    }, 4000);
}

// Start app
init();
