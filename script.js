// Scentorium - Cart & Wishlist System
// Handles sidebar functionality, cart management, and wishlist across all pages

(function() {
    'use strict';

    // ==================== AUTHENTICATION ====================
    let currentUser = null;

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                currentUser = await response.json();
                updateAuthUI(true);
            } else {
                currentUser = null;
                updateAuthUI(false);
            }
        } catch (error) {
            console.log('Auth check:', error.message);
            currentUser = null;
            updateAuthUI(false);
        }
    }

    function updateAuthUI(isLoggedIn) {
        const loggedOutView = document.getElementById('logged-out-view');
        const loggedInView = document.getElementById('logged-in-view');
        
        if (!loggedOutView || !loggedInView) return;

        if (isLoggedIn && currentUser) {
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';
            
            const avatar = document.getElementById('user-avatar');
            const name = document.getElementById('user-name');
            const email = document.getElementById('user-email');
            
            if (avatar && currentUser.profileImageUrl) {
                avatar.src = currentUser.profileImageUrl;
            } else if (avatar) {
                avatar.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent((currentUser.firstName || '') + ' ' + (currentUser.lastName || '')) + '&background=00ABB9&color=fff';
            }
            
            if (name) {
                const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ');
                name.textContent = fullName || 'Welcome back!';
            }
            
            if (email && currentUser.email) {
                email.textContent = currentUser.email;
            }
        } else {
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
        }
    }

    // Check auth on page load
    document.addEventListener('DOMContentLoaded', function() {
        checkAuthStatus();
    });

    // ==================== CART & WISHLIST DATA ====================
    let cart = JSON.parse(localStorage.getItem('scentorium_cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('scentorium_wishlist')) || [];

    // ==================== SIDEBAR FUNCTIONS ====================
    function openSidebar(id, tab) {
        var el = document.getElementById(id);
        var overlay = document.getElementById('sidebar-overlay');
        if (!el) return;
        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');
        if (overlay) overlay.classList.add('show');
        try { document.body.classList.add('sidebar-open'); } catch(e) {}
        try {
            var active = document.activeElement;
            if (active && /INPUT|TEXTAREA|SELECT/.test(active.tagName)) {
                active.blur();
            }
        } catch(e) {}
        if (tab) { showSidebarTab(tab); }
    }

    function closeSidebar(id) {
        var el = document.getElementById(id);
        var overlay = document.getElementById('sidebar-overlay');
        if (!el) return;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        if (overlay) overlay.classList.remove('show');
        try { document.body.classList.remove('sidebar-open'); } catch(e) {}
        try { hideAllPanels(); } catch(e) {}
    }

    function showSidebarTab(name) {
        var tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(function(b) {
            var sel = b.getAttribute('data-tab') === name;
            b.setAttribute('aria-selected', sel ? 'true' : 'false');
            b.classList.toggle('active', sel);
        });
        var panels = document.querySelectorAll('.panel');
        panels.forEach(function(p) {
            var matches = p.id === 'panel-' + name;
            p.style.display = matches ? '' : 'none';
            p.setAttribute('aria-hidden', matches ? 'false' : 'true');
        });
        var title = document.getElementById('sidebar-title');
        if (title) title.textContent = (name === 'account' ? 'Account' : name === 'wishlist' ? 'Your Wishlist' : 'Your Cart');
    }

    function hideAllPanels() {
        var tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(function(b) { b.setAttribute('aria-selected', 'false'); b.classList.remove('active'); });
        var panels = document.querySelectorAll('.panel');
        panels.forEach(function(p) { p.style.display = 'none'; p.setAttribute('aria-hidden', 'true'); });
    }

    // Make openSidebar globally available
    window.openUnifiedSidebar = function(tab) {
        openSidebar('main-sidebar', tab);
    };

    // ==================== PRODUCT DATA EXTRACTION ====================
    function getProductDataFromCard(card) {
        if (!card) return null;

        const productId = card.dataset.productId || generateProductId();
        const brandEl = card.querySelector('h3');
        const nameEl = card.querySelector('.product-name');
        const imgEl = card.querySelector('img');
        
        let price = 0;
        const discountedPriceEl = card.querySelector('.discounted-price');
        const giftPriceEl = card.querySelector('.gift-price');
        const trendingPriceEl = card.querySelector('.trending-price');
        const priceEl = discountedPriceEl || giftPriceEl || trendingPriceEl;
        
        if (priceEl) {
            price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0;
        }

        return {
            id: productId,
            brand: brandEl ? brandEl.textContent.trim() : 'Unknown',
            name: nameEl ? nameEl.textContent.trim() : 'Product',
            price: price,
            image: imgEl ? imgEl.src : '',
            quantity: 1
        };
    }

    function generateProductId() {
        return 'prod_' + Math.random().toString(36).substr(2, 9);
    }

    // ==================== CART FUNCTIONS ====================
    function addToCart(product) {
        if (!product) return;

        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();
        showNotification(`${product.brand} ${product.name} added to cart!`);
        openSidebar('main-sidebar', 'cart');
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    }

    function updateCartQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    }

    function saveCart() {
        localStorage.setItem('scentorium_cart', JSON.stringify(cart));
    }

    function getCartTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function getCartCount() {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    // ==================== WISHLIST FUNCTIONS ====================
    function addToWishlist(product) {
        if (!product) return;

        const existingIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            removeFromWishlist(product.id);
            showNotification(`${product.brand} ${product.name} removed from wishlist`);
            return false;
        } else {
            wishlist.push(product);
            saveWishlist();
            updateWishlistUI();
            showNotification(`${product.brand} ${product.name} added to wishlist!`);
            return true;
        }
    }

    function removeFromWishlist(productId) {
        wishlist = wishlist.filter(item => item.id !== productId);
        saveWishlist();
        updateWishlistUI();
    }

    function isInWishlist(productId) {
        return wishlist.some(item => item.id === productId);
    }

    function saveWishlist() {
        localStorage.setItem('scentorium_wishlist', JSON.stringify(wishlist));
    }

    // ==================== UI UPDATE FUNCTIONS ====================
    function updateCartUI() {
        const cartItemsList = document.querySelector('.cart-items, #cart-items');
        const subtotalElement = document.querySelector('.subtotal span:last-child, #cart-subtotal');
        const totalElement = document.querySelector('.total span:last-child, #cart-total');

        if (cartItemsList) {
            if (cart.length === 0) {
                cartItemsList.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
            } else {
                cartItemsList.innerHTML = cart.map(item => `
                    <li class="cart-item" data-cart-item-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
                        <div class="meta">
                            <div class="title">${item.brand} - ${item.name}</div>
                            <div class="price">$${item.price.toFixed(2)}</div>
                            <div class="quantity-controls">
                                <button class="qty-btn minus" data-cart-action="decrease" data-product-id="${item.id}">-</button>
                                <span class="qty">${item.quantity}</span>
                                <button class="qty-btn plus" data-cart-action="increase" data-product-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-cart-action="remove" data-product-id="${item.id}">
                            <i class="bx bx-trash"></i>
                        </button>
                    </li>
                `).join('');
            }
        }

        const total = getCartTotal();
        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;

        updateCartCount();
    }

    function updateCartCount() {
        const count = getCartCount();
        const cartCountElements = document.querySelectorAll('.cart-count, #cartCount, #cartCountMobile');
        
        cartCountElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });

        const headerCartBtn = document.querySelector('.header-actions .action-btn.cart');
        if (headerCartBtn) {
            let countSpan = headerCartBtn.querySelector('.cart-count');
            if (!countSpan) {
                countSpan = document.createElement('span');
                countSpan.className = 'cart-count';
                headerCartBtn.appendChild(countSpan);
            }
            countSpan.textContent = count;
            countSpan.style.display = count > 0 ? 'block' : 'none';
        }
    }

    function updateWishlistUI() {
        const wishlistItemsList = document.querySelector('.wishlist-items, #wishlist-items');
        const wishlistCountElements = document.querySelectorAll('.wishlist-count, #wishlistCount, #wishlistCountMobile');
        
        wishlistCountElements.forEach(el => {
            el.textContent = wishlist.length;
            el.style.display = wishlist.length > 0 ? 'flex' : 'none';
        });

        if (wishlistItemsList) {
            if (wishlist.length === 0) {
                wishlistItemsList.innerHTML = '<li class="empty-wishlist">Your wishlist is empty</li>';
            } else {
                wishlistItemsList.innerHTML = wishlist.map(item => `
                    <li class="wishlist-item" data-wishlist-item-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
                        <div class="meta">
                            <div class="title">${item.brand} - ${item.name}</div>
                            <div class="price">$${item.price.toFixed(2)}</div>
                        </div>
                        <div class="wishlist-actions">
                            <button class="add-to-cart-from-wishlist" data-wishlist-action="add-to-cart" data-product-id="${item.id}">
                                <i class="bx bx-shopping-bag"></i>
                            </button>
                            <button class="remove-wishlist-item" data-wishlist-action="remove" data-product-id="${item.id}">
                                <i class="bx bx-trash"></i>
                            </button>
                        </div>
                    </li>
                `).join('');
            }
        }

        updateWishlistButtonStates();
    }

    function updateWishlistButtonStates() {
        document.querySelectorAll('.wishlist-btn[data-action="wishlist"]').forEach(btn => {
            const card = btn.closest('[data-product-id]');
            if (card) {
                const productId = card.dataset.productId;
                const isInList = isInWishlist(productId);
                btn.classList.toggle('active', isInList);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isInList ? 'bx bxs-heart' : 'bx bx-heart';
                }
            }
        });
    }

    function showNotification(message) {
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #00ABB9;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                font-weight: 500;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';

        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
        }, 2500);
    }

    // ==================== EVENT LISTENERS ====================
    document.addEventListener('DOMContentLoaded', function() {
        // Highlight active nav link
        var currentPath = window.location.pathname.split('/').pop();
        var navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(function(link) {
            var linkHref = link.getAttribute('href');
            if (linkHref === currentPath) {
                link.classList.add('active');
            }
        });

        // Initialize UI
        updateCartUI();
        updateWishlistUI();
    });

    document.addEventListener('click', function(e) {
        var t = e.target;

        // Header action buttons (account, wishlist, cart icons)
        var headerAction = t.closest && t.closest('.header-actions .action-btn');
        if (headerAction) {
            var sid = headerAction.getAttribute('data-sidebar');
            var tab = headerAction.getAttribute('data-tab');
            if (sid) openSidebar(sid, tab);
        }

        // Sidebar open triggers with data-open-sidebar attribute
        var sidebarTrigger = t.closest && t.closest('[data-open-sidebar]');
        if (sidebarTrigger) {
            e.preventDefault();
            var sidebarType = sidebarTrigger.dataset.openSidebar;
            if (sidebarType) {
                openSidebar('main-sidebar', sidebarType);
            }
        }

        // Tab buttons inside sidebar
        var tabBtn = t.closest && t.closest('.tab-btn');
        if (tabBtn) {
            var tabname = tabBtn.getAttribute('data-tab');
            showSidebarTab(tabname);
        }

        // Close buttons inside sidebars
        if (t.matches('.close-btn') || (t.closest && t.closest('.close-btn'))) {
            var cb = t.matches('.close-btn') ? t : t.closest('.close-btn');
            var sid = cb.getAttribute('data-close');
            if (sid) closeSidebar(sid);
        }

        // Overlay click
        if (t.matches('[data-close-overlay]')) {
            var overlays = document.querySelectorAll('.sidebar.open');
            overlays.forEach(function(s) { closeSidebar(s.id); });
        }

        // Cart action buttons on product cards
        var cartBtn = t.closest && t.closest('.cart-btn[data-action="add-to-cart"], [data-action="add-to-cart"]');
        if (cartBtn && !t.closest('.wishlist-item')) {
            e.preventDefault();
            e.stopPropagation();
            var card = cartBtn.closest('[data-product-id]');
            if (card) {
                var product = getProductDataFromCard(card);
                if (product) addToCart(product);
            }
        }

        // Wishlist button on product cards
        var wishlistBtn = t.closest && t.closest('.wishlist-btn[data-action="wishlist"]');
        if (wishlistBtn) {
            e.preventDefault();
            e.stopPropagation();
            var card = wishlistBtn.closest('[data-product-id]');
            if (card) {
                var product = getProductDataFromCard(card);
                if (product) {
                    var added = addToWishlist(product);
                    wishlistBtn.classList.toggle('active', added);
                    var icon = wishlistBtn.querySelector('i');
                    if (icon) {
                        icon.className = added ? 'bx bxs-heart' : 'bx bx-heart';
                    }
                }
            }
        }

        // Cart item actions (increase, decrease, remove)
        var cartAction = t.closest && t.closest('[data-cart-action]');
        if (cartAction) {
            e.preventDefault();
            var action = cartAction.dataset.cartAction;
            var productId = cartAction.dataset.productId;
            
            if (action === 'increase') {
                updateCartQuantity(productId, 1);
            } else if (action === 'decrease') {
                updateCartQuantity(productId, -1);
            } else if (action === 'remove') {
                removeFromCart(productId);
            }
        }

        // Wishlist item actions
        var wishlistAction = t.closest && t.closest('[data-wishlist-action]');
        if (wishlistAction) {
            e.preventDefault();
            var action = wishlistAction.dataset.wishlistAction;
            var productId = wishlistAction.dataset.productId;
            
            if (action === 'remove') {
                removeFromWishlist(productId);
            } else if (action === 'add-to-cart') {
                var item = wishlist.find(item => item.id === productId);
                if (item) {
                    addToCart(item);
                }
            }
        }

        // Checkout button
        if (t.matches('.checkout') || t.closest('.checkout')) {
            e.preventDefault();
            localStorage.setItem('scentorium_cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        }
    });

    // Escape key to close sidebar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var open = document.querySelectorAll('.sidebar.open');
            open.forEach(function(s) { closeSidebar(s.id); });
        }
    });

    // Make functions globally available for other scripts
    window.scentoriumCart = {
        add: addToCart,
        remove: removeFromCart,
        updateQuantity: updateCartQuantity,
        getItems: function() { return cart; },
        getTotal: getCartTotal,
        getCount: getCartCount,
        clear: function() {
            cart = [];
            saveCart();
            updateCartUI();
        }
    };

    window.scentoriumWishlist = {
        add: addToWishlist,
        remove: removeFromWishlist,
        isIn: isInWishlist,
        getItems: function() { return wishlist; },
        clear: function() {
            wishlist = [];
            saveWishlist();
            updateWishlistUI();
        }
    };

})();
