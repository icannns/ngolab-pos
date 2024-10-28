document.addEventListener('DOMContentLoaded', function () {
    // Filter Kategori
    const links = document.querySelectorAll('#sidebar .nav-link');
    const sections = document.querySelectorAll('.category-section');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(filter).style.display = 'block';
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Tampilkan kategori pertama secara default
    document.getElementById('coworking').style.display = 'block';

    // Logika Order Type
    const orderDescription = document.getElementById('order-description');
    document.querySelectorAll('.order-type').forEach(button => {
        button.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            let description = '';

            if (type === 'To Go') {
                description = 'To Go Selected.';
            } else if (type === 'Delivery') {
                description = 'Delivery selected. Delivery charges apply.';
            } else {
                description = 'Dine In selected.';
            }

            orderDescription.textContent = description;
            calculateDiscount(type);
        });
    });

    let orderItems = [];
    let subtotal = 0;
    let discount = 0;

    // Tambah ke Pesanan
    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', function () {
            const item = this.getAttribute('data-item');
            const price = parseInt(this.getAttribute('data-price'));
            const existingItemIndex = orderItems.findIndex(order => order.item === item);

            if (existingItemIndex > -1) {
                orderItems[existingItemIndex].quantity++;
            } else {
                orderItems.push({ item, price, quantity: 1 });
            }

            updateOrderSummary();
        });
    });

    // Voucher and Discount Logic
    document.getElementById('apply-voucher').addEventListener('click', function () {
        const voucher = document.getElementById('voucher').value.trim();
        applyVoucher(voucher);
    });

    function applyVoucher(voucher) {
        if (voucher === 'DISKON15') {
            discount = subtotal * 0.15;
        } else if (voucher === 'DISKON25') {
            discount = subtotal * 0.25;
        } else {
            discount = 0;
            alert('Invalid voucher');
        }
        updateOrderSummary();
    }

    function calculateDiscount(type) {
        if (type === 'To Go' || type === 'Delivery') {
            discount = subtotal * 0.1; // Discount 10%
        } else {
            discount = 0; // Dine In, no discount
        }
        updateOrderSummary();
    }

    function updateOrderSummary() {
        const orderList = document.getElementById('order-items');
        orderList.innerHTML = ''; // Bersihkan item pesanan
        subtotal = 0;

        orderItems.forEach((order, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            const itemTotal = order.price * order.quantity;

            itemDiv.innerHTML = `
                <span>${order.item}</span>
                <div class="input-group">
                    <button class="btn btn-outline-secondary decrease-item" data-index="${index}">-</button>
                    <input type="text" class="form-control text-center" value="${order.quantity}" style="max-width: 50px;" readonly>
                    <button class="btn btn-outline-secondary increase-item" data-index="${index}">+</button>
                    <span class="ms-3">Rp${itemTotal}</span>
                </div>
            `;
            orderList.appendChild(itemDiv);
            subtotal += itemTotal;
        });

        document.getElementById('subtotal').textContent = `Rp${subtotal}`;
        document.getElementById('discount').textContent = `-Rp${discount}`;
        document.getElementById('total').textContent = `Rp${subtotal - discount}`;

        // Handle increase and decrease buttons
        document.querySelectorAll('.increase-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                orderItems[index].quantity++;
                updateOrderSummary();
            });
        });

        document.querySelectorAll('.decrease-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                if (orderItems[index].quantity > 1) {
                    orderItems[index].quantity--;
                } else {
                    orderItems.splice(index, 1); // Hapus item jika quantity 0
                }
                updateOrderSummary();
            });
        });
    }

    // Open Payment Modal when Continue to Payment is clicked
    document.querySelector('.btn-success').addEventListener('click', function () {
        updatePaymentModal();
        new bootstrap.Modal(document.getElementById('paymentModal')).show();
    });

    // Update Payment Modal with selected items and totals
    function updatePaymentModal() {
        const selectedItemsList = document.getElementById('selected-items');
        selectedItemsList.innerHTML = ''; // Clear previous items
        orderItems.forEach(order => {
            const listItem = document.createElement('li');
            listItem.textContent = `${order.item} (x${order.quantity}) - Rp${order.price * order.quantity}`;
            selectedItemsList.appendChild(listItem);
        });
        document.getElementById('modal-subtotal').textContent = `Rp${subtotal}`;
        document.getElementById('modal-discount').textContent = `-Rp${discount}`;
        document.getElementById('modal-total').textContent = `Rp${subtotal - discount}`;
    }

    // Show/Hide QRIS or Cash section based on payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener('change', function () {
            const paymentMethod = this.value;
            if (paymentMethod === 'QRIS') {
                document.getElementById('qris-section').style.display = 'block';
                document.getElementById('cash-section').style.display = 'none';
            } else {
                document.getElementById('qris-section').style.display = 'none';
                document.getElementById('cash-section').style.display = 'block';
            }
        });
    });

    // Handle Confirm Payment button
    document.getElementById('confirm-payment').addEventListener('click', function () {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (paymentMethod) {
            if (paymentMethod.value === 'QRIS') {
                alert('Payment confirmed via QRIS.');
            } else if (paymentMethod.value === 'Cash') {
                alert('Payment confirmed via Cash.');
            }
            // After confirmation, close the modal and reset the order
            const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            paymentModal.hide();
            resetOrder();
        } else {
            alert('Please select a payment method.');
        }
    });

    // Function to reset the order after payment
    function resetOrder() {
        orderItems = [];
        subtotal = 0;
        discount = 0;
        updateOrderSummary();
    }
});
// Event listener for the 'Continue to Payment' button
document.querySelector('.btn-success.mt-3').addEventListener('click', function () {
    // Ambil nama pemesan dari input
    const customerName = document.getElementById('customer-name').value;
    
    // Tampilkan nama pemesan di modal
    document.getElementById('modal-customer-name').textContent = customerName || '-';

    // Tampilkan modal pembayaran
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
});

document.addEventListener('DOMContentLoaded', function () {
    // Filter Kategori
    const links = document.querySelectorAll('#sidebar .nav-link');
    const sections = document.querySelectorAll('.category-section');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(filter).style.display = 'block';
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set kategori pertama yang aktif
    document.getElementById('coworking').style.display = 'block';

    // Logika Order Type
    const orderDescription = document.getElementById('order-description');
    let orderType = '';  // Variabel untuk menyimpan tipe order
    document.querySelectorAll('.order-type').forEach(button => {
        button.addEventListener('click', function () {
            orderType = this.getAttribute('data-type');
            orderDescription.textContent = `${orderType} selected.`;
            calculateDiscount(orderType);
        });
    });

    let orderItems = [];
    let subtotal = 0;
    let discount = 0;

    // Tambah ke Pesanan
    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', function () {
            const item = this.getAttribute('data-item');
            const price = parseInt(this.getAttribute('data-price'));
            const existingItemIndex = orderItems.findIndex(order => order.item === item);

            if (existingItemIndex > -1) {
                orderItems[existingItemIndex].quantity++;
            } else {
                orderItems.push({ item, price, quantity: 1 });
            }

            updateOrderSummary();
        });
    });

    // Voucher dan Discount Logic
    document.getElementById('apply-voucher').addEventListener('click', function () {
        const voucher = document.getElementById('voucher').value.trim();
        applyVoucher(voucher);
    });

    function applyVoucher(voucher) {
        if (voucher === 'DISKON15') {
            discount = subtotal * 0.15;
        } else if (voucher === 'DISKON25') {
            discount = subtotal * 0.25;
        } else {
            discount = 0;
            alert('Invalid voucher');
        }
        updateOrderSummary();
    }

    function calculateDiscount(type) {
        discount = (type === 'To Go' || type === 'Delivery') ? subtotal * 0.1 : 0;
        updateOrderSummary();
    }

    function updateOrderSummary() {
        const orderList = document.getElementById('order-items');
        orderList.innerHTML = ''; 
        subtotal = 0;

        orderItems.forEach((order, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            const itemTotal = order.price * order.quantity;

            itemDiv.innerHTML = `
                <span>${order.item}</span>
                <div class="input-group">
                    <button class="btn btn-outline-secondary decrease-item" data-index="${index}">-</button>
                    <input type="text" class="form-control text-center" value="${order.quantity}" style="max-width: 50px;" readonly>
                    <button class="btn btn-outline-secondary increase-item" data-index="${index}">+</button>
                    <span class="ms-3">Rp${itemTotal}</span>
                </div>
            `;
            orderList.appendChild(itemDiv);
            subtotal += itemTotal;
        });

        document.getElementById('subtotal').textContent = `Rp${subtotal}`;
        document.getElementById('discount').textContent = `-Rp${discount}`;
        document.getElementById('total').textContent = `Rp${subtotal - discount}`;

        document.querySelectorAll('.increase-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                orderItems[index].quantity++;
                updateOrderSummary();
            });
        });

        document.querySelectorAll('.decrease-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                if (orderItems[index].quantity > 1) {
                    orderItems[index].quantity--;
                } else {
                    orderItems.splice(index, 1);
                }
                updateOrderSummary();
            });
        });
    }

    document.querySelector('.btn-success').addEventListener('click', function () {
        updatePaymentModal();
        new bootstrap.Modal(document.getElementById('paymentModal')).show();
    });

    function updatePaymentModal() {
        const selectedItemsList = document.getElementById('selected-items');
        selectedItemsList.innerHTML = '';
        orderItems.forEach(order => {
            const listItem = document.createElement('li');
            listItem.textContent = `${order.item} (x${order.quantity}) - Rp${order.price * order.quantity}`;
            selectedItemsList.appendChild(listItem);
        });
        document.getElementById('modal-subtotal').textContent = `Rp${subtotal}`;
        document.getElementById('modal-discount').textContent = `-Rp${discount}`;
        document.getElementById('modal-total').textContent = `Rp${subtotal - discount}`;
    }

    document.getElementById('confirm-payment').addEventListener('click', function () {
        const customerName = document.getElementById('customer-name').value || 'Unknown';
        const selectedItems = orderItems.map(order => `${order.item} (x${order.quantity})`).join(', ');
        let outletSection;

        // Menentukan outlet section berdasarkan orderType
        if (orderType === 'Dine In' || orderType === 'To Go') {
            outletSection = document.getElementById('list-coworking');
        } else if (orderType === 'Delivery') {
            outletSection = document.getElementById('list-express');
        } else {
            outletSection = document.getElementById('list-kortail');
        }

        const transactionItem = document.createElement('li');
        transactionItem.classList.add('list-group-item');
        transactionItem.innerHTML = `
            <div><strong>Order #${Date.now()}</strong> - ${selectedItems}</div>
            <div>Rp${subtotal - discount} - <strong>Pemesan: ${customerName}</strong></div>
        `;

        outletSection.querySelector('.transaction-list').appendChild(transactionItem);
        outletSection.style.display = 'block';

        resetOrder();
        const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        paymentModal.hide();
    });

    function resetOrder() {
        orderItems = [];
        subtotal = 0;
        discount = 0;
        updateOrderSummary();
    }
});
