// Catalog Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initFilters();
    initViewToggle();
    initColumnToggle();
    initWishlistButtons();
    initSorting();
    initPagination();
    initMobileFilterToggle();
    applyUrlCategoryFilter();
    initResultsCount();
});

function applyUrlCategoryFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && ['men', 'women', 'unisex'].includes(category.toLowerCase())) {
        const categoryCheckbox = document.querySelector(`input[name="category"][value="${category.toLowerCase()}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
            filterProducts();
        }
    }
}

function initResultsCount() {
    const products = document.querySelectorAll('.product-card');
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = products.length;
    }
}

// Filter functionality
function initFilters() {
    const filterTitles = document.querySelectorAll('.filter-title');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

    // Toggle filter sections
    filterTitles.forEach(title => {
        title.addEventListener('click', function() {
            const targetId = this.getAttribute('data-toggle') + '-options';
            const options = document.getElementById(targetId);
            
            if (options) {
                this.classList.toggle('collapsed');
                options.classList.toggle('hidden');
            }
        });
    });

    // Filter products on checkbox change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    // Clear all filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            checkboxes.forEach(cb => cb.checked = false);
            filterProducts();
        });
    }
}

function filterProducts() {
    const products = document.querySelectorAll('.product-card');
    const activeFilters = getActiveFilters();
    let visibleCount = 0;

    products.forEach(product => {
        const shouldShow = matchesFilters(product, activeFilters);
        product.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });

    // Update results count
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = visibleCount;
    }
}

function getActiveFilters() {
    const filters = {
        category: [],
        brand: [],
        price: [],
        scent: []
    };

    document.querySelectorAll('.filter-option input[type="checkbox"]:checked').forEach(cb => {
        const filterType = cb.name;
        if (filters[filterType]) {
            filters[filterType].push(cb.value);
        }
    });

    return filters;
}

function matchesFilters(product, filters) {
    // If no filters are active, show all products
    const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
    if (!hasActiveFilters) return true;

    // Check each filter type
    for (const [filterType, values] of Object.entries(filters)) {
        if (values.length === 0) continue;

        const productValue = product.dataset[filterType];
        
        if (filterType === 'price') {
            const productPrice = parseFloat(productValue);
            const matchesPrice = values.some(range => {
                if (range === '0-50') return productPrice < 50;
                if (range === '50-100') return productPrice >= 50 && productPrice < 100;
                if (range === '100-200') return productPrice >= 100 && productPrice < 200;
                if (range === '200+') return productPrice >= 200;
                return false;
            });
            if (!matchesPrice) return false;
        } else {
            if (!values.includes(productValue)) return false;
        }
    }

    return true;
}

// View toggle (grid/list)
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Toggle view class
            if (productsGrid) {
                productsGrid.classList.toggle('list-view', view === 'list');
            }
        });
    });
}

// Column toggle (4 or 5 per row)
function initColumnToggle() {
    const columnSelect = document.getElementById('columnSelect');
    const productsGrid = document.getElementById('productsGrid');

    if (columnSelect && productsGrid) {
        // Set initial state based on select value
        const initialValue = columnSelect.value;
        productsGrid.classList.remove('columns-4', 'columns-5');
        productsGrid.classList.add(`columns-${initialValue}`);

        columnSelect.addEventListener('change', function() {
            const columns = this.value;
            const isListView = productsGrid.classList.contains('list-view');
            
            // Remove existing column classes only, preserve list-view state
            productsGrid.classList.remove('columns-4', 'columns-5');
            
            // Add new column class
            productsGrid.classList.add(`columns-${columns}`);
            
            // If in list view, switch to grid view when changing columns
            if (isListView) {
                productsGrid.classList.remove('list-view');
                // Update view buttons to show grid is active
                const viewBtns = document.querySelectorAll('.view-btn');
                viewBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === 'grid');
                });
            }
        });
    }
}

// Wishlist buttons - now handled by global script.js
function initWishlistButtons() {
    // Check wishlist state and update button appearances
    if (window.scentoriumWishlist) {
        document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
            const productId = card.dataset.productId;
            const wishlistBtn = card.querySelector('.wishlist-btn');
            if (wishlistBtn && window.scentoriumWishlist.isIn(productId)) {
                wishlistBtn.classList.add('active');
                const icon = wishlistBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('bx-heart');
                    icon.classList.add('bxs-heart');
                }
            }
        });
    }
}

// Sorting functionality
function initSorting() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const productsGrid = document.getElementById('productsGrid');
            const products = Array.from(productsGrid.querySelectorAll('.product-card'));

            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price) || 0;
                const priceB = parseFloat(b.dataset.price) || 0;

                switch (sortValue) {
                    case 'price-low':
                        return priceA - priceB;
                    case 'price-high':
                        return priceB - priceA;
                    case 'newest':
                        // For demo, reverse the order
                        return -1;
                    case 'rating':
                        // For demo, keep original order
                        return 0;
                    default:
                        return 0;
                }
            });

            // Re-append sorted products
            products.forEach(product => productsGrid.appendChild(product));
        });
    }
}

// Pagination (demo functionality)
function initPagination() {
    const pageBtns = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');

    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            pageBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update prev/next button states
            updatePaginationState();
            
            // Scroll to top of products
            document.querySelector('.catalog-content').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const activePage = document.querySelector('.page-btn.active');
            const prevPage = activePage?.previousElementSibling;
            if (prevPage && prevPage.classList.contains('page-btn') && !prevPage.classList.contains('prev')) {
                prevPage.click();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const activePage = document.querySelector('.page-btn.active');
            const nextPage = activePage?.nextElementSibling;
            if (nextPage && nextPage.classList.contains('page-btn') && !nextPage.classList.contains('next')) {
                nextPage.click();
            }
        });
    }
}

function updatePaginationState() {
    const pageBtns = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    const activePage = document.querySelector('.page-btn.active');

    if (prevBtn) {
        prevBtn.disabled = activePage === pageBtns[0];
    }
    if (nextBtn) {
        nextBtn.disabled = activePage === pageBtns[pageBtns.length - 1];
    }
}

// Add to cart functionality
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.product-card');
        const productName = card.querySelector('.product-name').textContent;
        
        // Visual feedback
        const originalText = this.textContent;
        this.textContent = 'Added!';
        this.style.background = '#4CAF50';
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
        }, 1500);
    });
});

// Quick view functionality
document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.product-card');
        const productName = card.querySelector('.product-name').textContent;
        const brandName = card.querySelector('.product-brand').textContent;
        
        // For now, just alert - could be replaced with a modal
        alert(`Quick View: ${brandName} - ${productName}`);
    });
});

// Mobile filter toggle
function initMobileFilterToggle() {
    const catalogContent = document.querySelector('.catalog-content');
    const filters = document.querySelector('.catalog-filters');
    
    if (!catalogContent || !filters) return;
    
    // Create mobile filter open button
    const mobileFilterBtn = document.createElement('button');
    mobileFilterBtn.className = 'mobile-filter-toggle';
    mobileFilterBtn.innerHTML = '<i class="bx bx-filter-alt"></i> Filter Products';
    catalogContent.insertBefore(mobileFilterBtn, catalogContent.firstChild);
    
    // Create close button inside filters panel
    const closeBtn = document.createElement('button');
    closeBtn.className = 'filter-close-btn';
    closeBtn.innerHTML = '<i class="bx bx-x"></i>';
    closeBtn.setAttribute('aria-label', 'Close filters');
    filters.insertBefore(closeBtn, filters.firstChild);
    
    // Open filters
    mobileFilterBtn.addEventListener('click', function() {
        filters.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close filters
    closeBtn.addEventListener('click', function() {
        filters.classList.remove('active');
        document.body.style.overflow = '';
    });
}
