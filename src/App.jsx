import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Wifi, Power } from 'lucide-react';

const FLAVORS = [
  { id: 'whey-iso', name: 'Optimum Whey Isolate', desc: 'Vanilla Ice Cream', image: '/images/whey-isolate.svg' },
  { id: 'pre-workout', name: 'C4 Pre-Workout', desc: 'Mixed Berry Blast', image: '/images/pre-workout.svg' },
  { id: 'vegan', name: 'Orgain Plant Protein', desc: 'Natural Green', image: '/images/plant-protein.svg' }
];

const DOSES = [
  { value: 40, label: 'Standard', desc: '40g' },
  { value: 60, label: 'Pro', desc: '60g' },
  { value: 80, label: 'Extreme', desc: '80g' },
];

// --- PRICING CONFIGURATION SYSTEM ---
// You can easily modify the base price (40g) and tier additions for each brand below:
const SHAKE_PRICES = {
  'whey-iso': {
    base: 100,      // Price for 40g in INR
    add60g: 20,     // Extra cost for 60g in INR (+20 to base)
    add80g: 40      // Extra cost for 80g in INR (+40 to base)
  },
  'pre-workout': {
    base: 90,       // Price for 40g in INR
    add60g: 15,     // Extra cost for 60g in INR (+15 to base)
    add80g: 30      // Extra cost for 80g in INR (+30 to base)
  },
  'vegan': {
    base: 110,      // Price for 40g in INR
    add60g: 25,     // Extra cost for 60g in INR (+25 to base)
    add80g: 50      // Extra cost for 80g in INR (+50 to base)
  }
};

export default function App() {
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedDose, setSelectedDose] = useState(null);
  const [glasses, setGlasses] = useState(1);
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isDispensing, setIsDispensing] = useState(false);

  const canAddToCart = selectedFlavor && selectedDose;
  
  const getItemPrice = (flavorId, dose) => {
    const pricing = SHAKE_PRICES[flavorId];
    if (!pricing) return 100;
    
    if (dose === 40) return pricing.base;
    if (dose === 60) return pricing.base + pricing.add60g;
    if (dose === 80) return pricing.base + pricing.add80g;
    
    return pricing.base;
  };
  
  const totalAmount = cart.reduce((total, item) => total + (getItemPrice(item.flavor.id, item.dose) * item.glasses), 0);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    const item = {
      id: Date.now(),
      flavor: selectedFlavor,
      dose: selectedDose,
      glasses
    };
    setCart([...cart, item]);
    setSelectedFlavor(null);
    setSelectedDose(null);
    setGlasses(1);
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const handleExitKiosk = () => {
    fetch('/api/minimize')
      .then(res => res.json())
      .then(data => console.log('Exit response:', data))
      .catch(err => console.error('Error triggering exit:', err));
  };

  const handleProcessPayment = (method) => {
    setPaymentMethod(method);
    
    // Simulate payment time
    setTimeout(() => {
      setShowPayment(false);
      setPaymentMethod(null);
      setIsDispensing(true);
      
      // Simulate dispense time
      setTimeout(() => {
        setIsDispensing(false);
        setCart([]);
        alert("Dispensing complete! Enjoy your peak performance fuel.");
      }, 4000);
    }, 3500);
  };

  return (
    <div className="app-container">
      {/* Floating Exit Kiosk Button */}
      <button 
        onClick={handleExitKiosk} 
        className="floating-exit-btn"
        title="Exit Kiosk Mode"
      >
        <Power size={22} />
      </button>

      <header>
        <h1>Novatech <span>Protein Vending Machine</span></h1>
        <p>Select your ultimate performance blend</p>
      </header>

      <main>
        <div className="selection-panel">
          <section className="step">
            <h2>1. Choose Brand & Supplement</h2>
            <div className="grid-options">
              {FLAVORS.map(flavor => (
                <button
                  key={flavor.id}
                  className={`option-btn ${selectedFlavor?.id === flavor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFlavor(flavor)}
                >
                  <img src={flavor.image} alt={flavor.name} className="product-image" />
                  {flavor.name}
                  <span>{flavor.desc}</span>
                  <span className="price-tag" style={{ color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                    From ₹{SHAKE_PRICES[flavor.id]?.base}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="step">
            <h2>2. Select Dose (per glass)</h2>
            <div className="grid-options">
              {DOSES.map(dose => {
                const calculatedPrice = selectedFlavor 
                  ? getItemPrice(selectedFlavor.id, dose.value)
                  : null;
                return (
                  <button
                    key={dose.value}
                    className={`option-btn ${selectedDose === dose.value ? 'selected' : ''}`}
                    onClick={() => setSelectedDose(dose.value)}
                  >
                    {dose.desc}<br/>
                    <span>
                      {dose.label} {calculatedPrice ? `(₹${calculatedPrice})` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="step">
            <h2>3. Number of Glasses</h2>
            <div className="counter-container">
              <button className="counter-btn" onClick={() => setGlasses(Math.max(1, glasses - 1))}>-</button>
              <span className="glasses-count">{glasses}</span>
              <button className="counter-btn" onClick={() => setGlasses(Math.min(5, glasses + 1))}>+</button>
            </div>
          </section>

          <button 
            className={`primary-btn ${canAddToCart ? 'ready' : ''}`} 
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            Add to Order
          </button>
        </div>

        <div className="order-summary-panel">
          <h2>Current Order</h2>
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Your order is empty. Fuel up!</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-details">
                    <h4>{item.glasses}x {item.flavor.name}</h4>
                    <p>{item.flavor.desc} | {item.dose}g (₹{getItemPrice(item.flavor.id, item.dose)}/gl)</p>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemoveFromCart(item.id)}>
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="order-total">
            <button 
              className="checkout-btn" 
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              Proceed to Payment (₹{totalAmount})
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        Developed by Novatech Robo Pvt Ltd
      </footer>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal">
          <div className="modal-content payment-content">
            <h2>Select Payment Method</h2>
            <p>Total Amount: <strong>₹{totalAmount}</strong></p>
            
            {!paymentMethod ? (
              <div className="payment-options">
                <button className="payment-btn active-payment" onClick={() => handleProcessPayment('qr')}>
                  <Smartphone className="payment-icon" size={24} />
                  UPI / QR Code <span className="available-tag">(Works Now)</span>
                </button>
                <button className="payment-btn disabled-payment" disabled title="Only UPI payments are supported currently">
                  <CreditCard className="payment-icon" size={24} />
                  Credit / Debit Card <span className="unavailable-tag">(Not Available)</span>
                </button>
                <button className="payment-btn disabled-payment" disabled title="Only UPI payments are supported currently">
                  <Wifi className="payment-icon" size={24} />
                  NFC / Tap to Pay <span className="unavailable-tag">(Not Available)</span>
                </button>
                <button className="secondary-btn" onClick={() => setShowPayment(false)}>Cancel</button>
              </div>
            ) : (
              <div className="qr-container">
                <div className="qr-placeholder">
                  {paymentMethod === 'qr' && '📱 Scan with UPI app'}
                  {paymentMethod === 'card' && '💳 Insert Card'}
                  {paymentMethod === 'nfc' && '📶 Tap Phone or Card'}
                </div>
                <p>Waiting for payment confirmation...</p>
                <div className="small-loader"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispensing Modal */}
      {isDispensing && (
        <div className="modal">
          <div className="modal-content">
            <div className="loader"></div>
            <h2>Dispensing...</h2>
            <p>Preparing your peak performance fuel</p>
          </div>
        </div>
      )}
    </div>
  );
}
