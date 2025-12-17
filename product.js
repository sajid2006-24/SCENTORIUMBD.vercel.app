
// Product page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sample product data (same as catalog.js)
    const products = [
        {
            id: 'chanel-no5-100',
            name: 'No. 5 Eau de Parfum',
            brand: 'CHANEL',
            category: 'women',
            price: 150.00,
            salePrice: 97.50,
            size: '100ml',
            description: 'The quintessence of femininity in a timeless fragrance that has captivated women for generations.',
            fullDescription: 'CHANEL N°5 is the very essence of femininity. Its bouquet, composed around May rose and jasmine, features bright citrus top notes. Aldehydes create a unique presence, while the smooth touch of vanilla and the mystery of amber reveal femininity in all its aspects.',
            image: '',
            images: ['', '', ''],
            badge: 'sale',
            discount: 35,
            featured: true,
            new: false,
            inStock: true,
            sizes: ['30ml', '50ml', '100ml'],
            notes: {
                top: ['Bergamot', 'Lemon', 'Aldehydes'],
                heart: ['May Rose', 'Jasmine', 'Lily of the Valley'],
                base: ['Vanilla', 'Amber', 'Sandalwood']
            }
        },
        {
            id: 'dior-sauvage-100',
            name: 'Sauvage Eau de Toilette',
            brand: 'DIOR',
            category: 'men',
            price: 120.00,
            salePrice: 90.00,
            size: '100ml',
            description: 'Fresh, raw and noble bergamot and ambroxan that creates a powerful masculine fragrance.',
            fullDescription: 'Sauvage is an act of creation inspired by wide-open spaces. A composition that plays with a deliberate contrast between the nobility of bergamot and the power of ambroxan, obtained from the ambergris.',
            image: '',
            images: ['', '', ''],
            badge: 'sale',
            discount: 25,
            featured: true,
            new: false,
            inStock: true,
            sizes: ['60ml', '100ml', '200ml'],
            notes: {
                top: ['Bergamot', 'Pink Pepper'],
                heart: ['Geranium', 'Lavender', 'Elemi'],
                base: ['Ambroxan', 'Cedar', 'Labdanum']
            }
        },
        {
            id: 'tomford-black-orchid',
            name: 'Black Orchid Eau de Parfum',
            brand: 'TOM FORD',
            category: 'unisex',
            price: 180.00,
            salePrice: 108.00,
            size: '50ml',
            description: 'Luxurious black orchid and spice fragrance that embodies modern glamour.',
            fullDescription: 'Tom Ford Black Orchid is a luxurious unisex fragrance that captures the true mystery of allure. Rich, dark, and sensual, this fragrance is a modern aphrodisiac that evokes a lush fantasy.',
            image: '',
            images: ['', '', ''],
            badge: 'sale',
            discount: 40,
            featured: true,
            new: false,
            inStock: true,
            sizes: ['30ml', '50ml', '100ml'],
            notes: {
                top: ['Truffle', 'Gardenia', 'Black Currant'],
                heart: ['Orchid', 'Spices', 'Fruity Notes'],
                base: ['Patchouli', 'Vanilla', 'Incense']
            }
        },
        {
            id: 'versace-eros-flame',
            name: 'Eros Flame Eau de Parfum',
            brand: 'VERSACE',
            category: 'men',
            price: 110.00,
            salePrice: 77.00,
            size: '100ml',
            description: 'Fresh citrus meets spicy pepper and woods in this passionate masculine fragrance.',
            fullDescription: 'Versace Eros Flame is a passionate fragrance that represents the man conquered by love. The scent is fresh, woody and oriental with citrus top notes.',
            image: '',
            images: ['', '', ''],
            badge: 'sale',
            discount: 30,
            featured: true,
            new: false,
            inStock: true,
            sizes: ['30ml', '50ml', '100ml'],
            notes: {
                top: ['Chinotto', 'Madagascar Black Pepper', 'Rosemary'],
                heart: ['Rose', 'Geranium', 'Pepperwood'],
                base: ['Texas Cedar', 'Patchouli', 'Oakmoss']
            }
        }
    ];

    let currentProduct = null;
    let selectedSize = '';
    let quantity = 1;

    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Load product data
    if (productId) {
        currentProduct = products.find(p => p.id === productId);
        if (currentProduct) {
            loadProductData(currentProduct);
        } else {
            // Product not found, redirect to catalog
            window.location.href = 'catalog.html';
        }
    } else {
        // No product ID, redirect to catalog
        window.location.href = 'catalog.html';
    }

    function loadProductData(product) {
        // Update breadcrumb
        document.getElementById('productBreadcrumb').textContent = product.name;

        // Update product images - always show placeholder
        const mainImageContainer = document.getElementById('mainImageContainer');
        const placeholder = document.getElementById('mainImagePlaceholder');
        
        // Always show placeholder since we don't have actual images
        placeholder.querySelector('p').textContent = `${product.brand} ${product.name}`;
        
        // Update thumbnails to show product-specific placeholders
        const thumbnails = document.querySelectorAll('.thumbnail-placeholder i');
        thumbnails.forEach((thumb, index) => {
            const icons = ['bx-gift', 'bx-package', 'bx-image'];
            thumb.className = `bx ${icons[index] || 'bx-image'}`;
        });

        // Update product badges
        const badgesContainer = document.getElementById('productBadges');
        if (product.badge) {
            const badge = document.createElement('div');
            badge.className = `product-badge ${product.badge}`;
            if (product.badge === 'sale' && product.discount) {
                badge.textContent = `${product.discount}% OFF`;
            } else {
                badge.textContent = product.badge.toUpperCase();
            }
            badgesContainer.appendChild(badge);
        }

        // Update product info
        document.getElementById('productBrand').textContent = product.brand;
        document.getElementById('productTitle').textContent = `${product.name} ${product.size}`;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('fullDescription').textContent = product.fullDescription;

        // Update pricing
        const currentPriceEl = document.getElementById('currentPrice');
        const originalPriceEl = document.getElementById('originalPrice');
        const discountBadgeEl = document.getElementById('discountBadge');
        const savingsInfoEl = document.getElementById('savingsInfo');

        const displayPrice = product.salePrice || product.price;
        currentPriceEl.textContent = `$${displayPrice.toFixed(2)}`;

        if (product.salePrice && product.salePrice < product.price) {
            originalPriceEl.textContent = `$${product.price.toFixed(2)}`;
            originalPriceEl.style.display = 'inline';
            
            if (product.discount) {
                discountBadgeEl.textContent = `${product.discount}% OFF`;
                discountBadgeEl.style.display = 'inline';
            }

            const savings = product.price - product.salePrice;
            savingsInfoEl.textContent = `You save $${savings.toFixed(2)}`;
            savingsInfoEl.style.display = 'block';
        }

        // Update size options
        const sizeOptionsContainer = document.getElementById('sizeOptions');
        if (product.sizes && product.sizes.length > 0) {
            sizeOptionsContainer.innerHTML = '';
            product.sizes.forEach((size, index) => {
                const sizeBtn = document.createElement('button');
                sizeBtn.className = 'size-option';
                sizeBtn.setAttribute('data-size', size);
                sizeBtn.textContent = size;
                if (index === 0) {
                    sizeBtn.classList.add('active');
                    selectedSize = size;
                }
                sizeOptionsContainer.appendChild(sizeBtn);
            });
        } else {
            selectedSize = product.size;
        }

        // Update fragrance notes
        if (product.notes) {
            const notesSection = document.querySelector('.notes-section');
            notesSection.innerHTML = `
                <div class="note-category">
                    <h4>Top Notes</h4>
                    <p>${product.notes.top.join(', ')}</p>
                </div>
                <div class="note-category">
                    <h4>Heart Notes</h4>
                    <p>${product.notes.heart.join(', ')}</p>
                </div>
                <div class="note-category">
                    <h4>Base Notes</h4>
                    <p>${product.notes.base.join(', ')}</p>
                </div>
            `;
        }

        // Load related products
        loadRelatedProducts(product);
    }

    function loadRelatedProducts(currentProduct) {
        const relatedProducts = products.filter(p => 
            p.id !== currentProduct.id && 
            (p.brand === currentProduct.brand || p.category === currentProduct.category)
        ).slice(0, 4);

        const relatedGrid = document.getElementById('relatedProductsGrid');
        relatedGrid.innerHTML = relatedProducts.map(product => {
            const hasDiscount = product.salePrice && product.salePrice < product.price;
            const displayPrice = product.salePrice || product.price;
            
            return `
                <div class="product-card" data-product-id="${product.id}" data-navigate="product">
                    <div class="product-image">
                        <div class="product-placeholder">
                            <i class='bx bx-gift' style="font-size: 32px; color: #9ca3af;"></i>
                            <span style="font-size: 10px; color: #6b7280; margin-top: 4px;">${product.brand}</span>
                        </div>
                        ${product.badge ? `<div class="product-badge ${product.badge}">${product.badge.toUpperCase()}</div>` : ''}
                        ${hasDiscount && product.discount ? `<div class="product-badge sale">${product.discount}% OFF</div>` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-brand">${product.brand}</div>
                        <h3 class="product-name">${product.name} ${product.size}</h3>
                        <div class="product-price">
                            <span class="current-price">$${displayPrice.toFixed(2)}</span>
                            ${hasDiscount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Size selection and product navigation
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('size-option')) {
                document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedSize = e.target.dataset.size;
            }
            
            // Related product navigation
            const productCard = e.target.closest('[data-navigate="product"]');
            if (productCard) {
                const productId = productCard.dataset.productId;
                if (productId) {
                    window.location.href = `product.html?id=${productId}`;
                }
            }
        });

        // Quantity controls
        document.getElementById('qtyMinus').addEventListener('click', function() {
            if (quantity > 1) {
                quantity--;
                document.getElementById('quantity').value = quantity;
            }
        });

        document.getElementById('qtyPlus').addEventListener('click', function() {
            if (quantity < 10) {
                quantity++;
                document.getElementById('quantity').value = quantity;
            }
        });

        document.getElementById('quantity').addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value >= 1 && value <= 10) {
                quantity = value;
            } else {
                this.value = quantity;
            }
        });

        // Tab functionality
        document.querySelectorAll('.tab-header').forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // Remove active class from all tabs and panes
                document.querySelectorAll('.tab-header').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });

        // Wishlist functionality
        document.getElementById('wishlistBtnLarge').addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('bx-heart')) {
                icon.classList.remove('bx-heart');
                icon.classList.add('bxs-heart');
                this.style.color = '#ef4444';
            } else {
                icon.classList.remove('bxs-heart');
                icon.classList.add('bx-heart');
                this.style.color = '#6b7280';
            }
        });

        // Add to cart functionality
        document.getElementById('addToCartLarge').addEventListener('click', function() {
            addToCartProduct();
        });

        // Buy now functionality
        document.getElementById('buyNowBtn').addEventListener('click', function() {
            addToCartProduct();
            window.location.href = 'checkout.html';
        });
    }

    function addToCartProduct() {
        if (currentProduct) {
            const cartItem = {
                id: currentProduct.id,
                name: currentProduct.name,
                brand: currentProduct.brand,
                size: selectedSize,
                price: currentProduct.salePrice || currentProduct.price,
                quantity: quantity,
                image: currentProduct.image
            };

            // Use existing cart functionality if available
            if (typeof window.addToCart === 'function') {
                for (let i = 0; i < quantity; i++) {
                    window.addToCart(currentProduct.id);
                }
            } else {
                // Simple cart storage
                let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const existingItem = cart.find(item => item.id === cartItem.id && item.size === cartItem.size);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push(cartItem);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${cartItem.name} added to cart!`);
            }
        }
    }

    // Global function to navigate to product
    window.navigateToProduct = function(productId) {
        window.location.href = `product.html?id=${productId}`;
    };
});
