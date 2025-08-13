
// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let customization = {};

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        if (cart.length > 0) {
            cartCount.textContent = cart.length;
            cartCount.style.display = 'inline';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

// Show flash message
function showFlashMessage(message, type = 'success') {
    const flashContainer = document.getElementById('flash-messages');
    if (flashContainer) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        flashContainer.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Add to cart
function addToCart(productId, productName, price, imageUrl) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image_url: imageUrl,
            quantity: 1,
            customization: {...customization}
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showFlashMessage(`${productName} added to cart!`);
    
    // Clear customization
    customization = {};
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Reload cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCartPage();
        }
    }
}

// Load cart page
function loadCartPage() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
                <h3>Your cart is empty</h3>
                <p class="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
                <a href="products.html" class="btn btn-primary btn-lg">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let cartHTML = `
        <div class="row">
            <div class="col-lg-8">
    `;
    
    cart.forEach(item => {
        cartHTML += `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="${item.image_url}" class="img-fluid rounded-start h-100" alt="${item.name}" 
                             style="object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/200x150/f8f9fa/6c757d?text=${item.name}'">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="card-title">${item.name}</h5>
                                    <p class="card-text">
                                        <span class="text-primary fw-bold">₹${item.price.toLocaleString('en-IN')}</span>
                                    </p>
                                    <div class="quantity-controls mb-2">
                                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                        <span class="mx-3">Qty: ${item.quantity}</span>
                                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                    </div>
                                    ${item.customization && Object.keys(item.customization).length > 0 ? `
                                    <div class="customization-info">
                                        <strong>Customizations:</strong><br>
                                        ${Object.entries(item.customization).map(([key, value]) => 
                                            `<small>${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</small>`
                                        ).join('<br>')}
                                    </div>
                                    ` : ''}
                                </div>
                                <div class="text-end">
                                    <p class="h5 text-primary">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    <button onclick="removeFromCart(${item.id})" class="btn btn-sm btn-outline-danger">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartHTML += `
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Order Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>₹${total.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong>Total:</strong>
                            <strong class="text-primary">₹${total.toLocaleString('en-IN')}</strong>
                        </div>
                        <div class="d-grid">
                            <a href="checkout.html" class="btn btn-primary btn-lg">
                                <i class="fas fa-credit-card me-2"></i>Proceed to Checkout
                            </a>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <a href="products.html" class="btn btn-outline-secondary w-100">
                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                    </a>
                </div>
            </div>
        </div>
    `;
    
    cartContainer.innerHTML = cartHTML;
}

// Product customization
function updateCustomization(field, value) {
    customization[field] = value;
    
    // Update price if willow type changes
    if (field === 'willow_type') {
        const prices = {
            'english_willow': 23450,
            'duo_core_willow': 28999,
            'premium_english_willow': 35678,
            'practice_willow': 12345
        };
        
        const priceElement = document.getElementById('product-price');
        if (priceElement) {
            priceElement.textContent = '₹' + prices[value].toLocaleString('en-IN');
        }
    }
}

// Load products
function loadProducts() {
    const products = [
        {
            id: 1,
            name: "Cricket Secret Professional Elite",
            description: "Premium cricket bat crafted from Grade A+ English willow with professional customization options. Perfect balance and power for elite players.",
            price: 23450.00,
            image_url: "bat1.jpg",
            category: "professional",
            weight: "1.2kg - 1.3kg",
            grade: "Grade A+",
            willow_type: "English Willow"
        },
        {
            id: 2,
            name: "Cricket Secret Duo Core Master",
            description: "High-performance cricket bat with Duo Core willow technology. Exceptional power and durability for serious cricketers.",
            price: 28999.00,
            image_url: "bat1.jpg",
            category: "professional",
            weight: "1.1kg - 1.2kg",
            grade: "Grade A+",
            willow_type: "Duo Core Willow"
        },
        {
            id: 3,
            name: "Cricket Secret Premium Classic",
            description: "Premium English willow bat with traditional craftsmanship and modern performance. The ultimate choice for champions.",
            price: 35678.00,
            image_url: "bat1.jpg",
            category: "premium",
            weight: "1.2kg - 1.3kg",
            grade: "Grade A++",
            willow_type: "Premium English Willow"
        },
        {
            id: 4,
            name: "Cricket Secret Practice Pro",
            description: "Durable practice cricket bat perfect for training sessions. Built to withstand intensive practice while maintaining performance.",
            price: 12345.00,
            image_url: "bat1.jpg",
            category: "practice",
            weight: "1.0kg - 1.1kg",
            grade: "Grade B+",
            willow_type: "Practice Willow"
        }
    ];
    
    return products;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Load cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
    
    // Handle customization form submissions
    const customizationForm = document.getElementById('customization-form');
    if (customizationForm) {
        customizationForm.addEventListener('change', function(e) {
            if (e.target.type === 'radio') {
                updateCustomization(e.target.name, e.target.value);
            }
        });
    }
});

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        showFlashMessage('Your cart is empty!', 'warning');
        return;
    }
    window.location.href = 'checkout.html';
}

// Initialize Razorpay payment
function initializePayment(orderData) {
    const options = {
        "key": "rzp_test_hkQ8kyfqkMQNiq",
        "amount": orderData.amount,
        "currency": "INR",
        "name": "Cricket Secret",
        "description": "Cricket Bat Purchase",
        "image": "logo.png",
        "order_id": orderData.id,
        "handler": function (response) {
            // Handle successful payment
            showFlashMessage('Payment successful! Your order has been confirmed.', 'success');
            
            // Store order details for confirmation page
            const orderDetails = {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: orderData.amount / 100,
                customer: orderData.customer,
                items: cart,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
            
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Redirect to order confirmation
            setTimeout(() => {
                window.location.href = 'order_confirmation.html?payment_id=' + response.razorpay_payment_id;
            }, 2000);
        },
        "prefill": {
            "name": orderData.customer_name || "",
            "email": orderData.customer_email || "",
            "contact": orderData.customer_phone || ""
        },
        "notes": {
            "address": "Cricket Secret Store"
        },
        "theme": {
            "color": "#3498db"
        },
        "modal": {
            "ondismiss": function() {
                showFlashMessage('Payment cancelled. You can try again.', 'warning');
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
        showFlashMessage('Payment failed: ' + response.error.description, 'error');
    });
    rzp.open();
}

// Contact form submission
function submitContactForm(e) {
    e.preventDefault();
    showFlashMessage('Thank you for your message! We will get back to you soon.', 'success');
    e.target.reset();
}

// Cash on Delivery processing
function processCODOrder(customerData) {
    const orderDetails = {
        order_id: 'COD_' + Date.now(),
        method: 'cod',
        amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: customerData,
        items: cart,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showFlashMessage('Order placed successfully! You will pay on delivery.', 'success');
    
    setTimeout(() => {
        window.location.href = 'order_confirmation.html?method=cod&order_id=' + orderDetails.order_id;
    }, 2000);
}
