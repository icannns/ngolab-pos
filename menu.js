


document.addEventListener("DOMContentLoaded", function () {
  // Initial Setup
  let orderItems = [];
  let subtotal = 0;
  let discount = 0;
  let selectedOrderType = "Dine In"; // Default Order Type

  // Elements
  const menuGrid = document.getElementById("menu-grid");
  const orderSummary = document.getElementById("order-items");
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");
  const applyVoucherBtn = document.getElementById("apply-voucher");
  const voucherInput = document.getElementById("voucher");
  const confirmPaymentBtn = document.getElementById("confirm-payment");
  const paymentModal = document.getElementById("paymentModal");
  const closeModalBtn = document.getElementById("closeModal");
  const confirmModalPaymentBtn = document.getElementById(
    "confirm-modal-payment"
  );
  const selectedItemsList = document.getElementById("selected-items");
  const modalSubtotal = document.getElementById("modal-subtotal");
  const modalDiscount = document.getElementById("modal-discount");
  const modalTotal = document.getElementById("modal-total");
  const paymentTypeSelect = document.getElementById("paymentType");
  const qrisSection = document.getElementById("qris-section");
  const cashSection = document.getElementById("cash-section");
  const editOrderModal = document.getElementById("editOrderModal");
  const closeEditModalBtn = document.getElementById("closeEditModal");
  const confirmEditOrderBtn = document.getElementById("confirmEditOrder");
  const orderNoteTextarea = document.getElementById("orderNote");
  const editOrderImage = document.getElementById("editOrderImage");
  const editOrderName = document.getElementById("editOrderName");
  const editOrderPrice = document.getElementById("editOrderPrice");
  const decreaseQuantityBtn = document.getElementById("decreaseQuantity");
  const increaseQuantityBtn = document.getElementById("increaseQuantity");
  const orderQuantityEl = document.getElementById("orderQuantity");

  let currentEditIndex = null; // To track which order is being edited
  let currentQuantity = 1;

  // Function to update the order summary
  function updateOrderSummary() {
    orderSummary.innerHTML = ""; // Clear current summary
    subtotal = 0;

    orderItems.forEach((order, index) => {
      subtotal += order.price * order.quantity;

      // Create order item card
      const orderCard = document.createElement("div");
      orderCard.classList.add(
        "flex",
        "items-center",
        "border",
        "border-gray-300",
        "rounded-lg",
        "p-2",
        "shadow-sm"
      );

      orderCard.innerHTML = `
              <img
                src="${order.image}"
                alt="${order.item}"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <div class="ml-4 flex-1">
                <h3 class="font-medium text-lg">
                  ${order.item} <span class="text-gray-500 font-medium">(${
        order.quantity
      })</span>
                </h3>
                <p class="w-32 overflow-hidden whitespace-nowrap text-ellipsis text-gray-500 text-sm mt-1">Catatan: ${
                  order.note || "Tidak ada"
                }</p>
                <div class="flex items-center justify-between mt-1">
                  <p class="font-medium text-base">Rp ${(
                    order.price * order.quantity
                  ).toLocaleString()}</p>
                  <div class="flex space-x-2">
                    <button
                      class="text-gray-500 hover:text-gray-700 transition edit-order"
                      data-index="${index}"
                      aria-label="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 010 2.828l-1.828 1.828-2.828-2.828 1.828-1.828a2 2 0 012.828 0zM15.586 7l-2.828-2.828L4 13v2.828h2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      class="text-red-500 hover:text-red-700 transition delete-order"
                      data-index="${index}"
                      aria-label="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-1 1v1H5a1 1 0 000 2h10a1 1 0 100-2h-3V3a1 1 0 00-1-1H9zM5 8a1 1 0 011-1h8a1 1 0 011 1v7a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            `;

      orderSummary.appendChild(orderCard);
    });

    // Update subtotal, discount, and total
    subtotalEl.textContent = `Rp${subtotal.toLocaleString()}`;
    discountEl.textContent =
      discount > 0 ? `-Rp${discount.toLocaleString()}` : `Rp0`;
    totalEl.textContent = `Rp${(subtotal - discount).toLocaleString()}`;
  }

  // Function to update "Tambah Pesanan" button
  function updateAddToOrderButton(button, quantity) {
    button.textContent = `Tambah(${quantity})`;
    button.classList.remove(
      "bg-gradient-to-r",
      "from-orange-400",
      "to-yellow-400",
      "text-white"
    );
    button.classList.add(
      "border-2",
      "border-yellow-400",
      "text-yellow-400",
      "bg-yellow-50"
    );
  }

  // Function to reset "Tambah Pesanan" buttons
  function resetAddToOrderButtons() {
    document.querySelectorAll(".add-to-order").forEach((button) => {
      button.textContent = "Tambah Pesanan";
      button.classList.remove(
        "border-2",
        "border-yellow-400",
        "text-yellow-400",
        "bg-yellow-50"
      );
      button.classList.add(
        "bg-gradient-to-r",
        "from-orange-400",
        "to-yellow-400",
        "text-white"
      );
    });
  }

  // Function to apply voucher
  function applyVoucher(voucher) {
    if (voucher === "DISKON15") {
      discount = subtotal * 0.15;
      alert("Voucher DISKON15 diterapkan! Diskon 15%.");
    } else if (voucher === "DISKON25") {
      discount = subtotal * 0.25;
      alert("Voucher DISKON25 diterapkan! Diskon 25%.");
    } else {
      discount = 0;
      alert("Voucher tidak valid.");
    }
    updateOrderSummary();
  }

  // Function to calculate discount based on order type
  function calculateDiscount(type) {
    // Reset discount
    discount = 0;

    if (type === "To Go" || type === "Takeaway") {
      discount += subtotal * 0.1; // Diskon tambahan 10%
    }
    updateOrderSummary();
  }

  // Function to update payment modal
  function updatePaymentModal() {
    selectedItemsList.innerHTML = ""; // Clear previous items
    orderItems.forEach((order) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${order.item} (x${order.quantity}) - Rp${(
        order.price * order.quantity
      ).toLocaleString()}`;
      selectedItemsList.appendChild(listItem);
    });
    modalSubtotal.textContent = `Rp${subtotal.toLocaleString()}`;
    modalDiscount.textContent =
      discount > 0 ? `-Rp${discount.toLocaleString()}` : `Rp0`;
    modalTotal.textContent = `Rp${(subtotal - discount).toLocaleString()}`;
  }

  // Function to reset the order after payment
  function resetOrder() {
    orderItems = [];
    subtotal = 0;
    discount = 0;
    updateOrderSummary();
    resetAddToOrderButtons();

    // Reset order type to default
    selectedOrderType = "Dine In";
    const orderTypeButtons = document.querySelectorAll(".order-type");
    orderTypeButtons.forEach((btn) => {
      btn.classList.remove(
        "bg-gradient-to-r",
        "from-orange-400",
        "to-yellow-400",
        "text-white",
        "active-order-type"
      );
      btn.classList.add("bg-gray-100", "text-gray-700");
    });
    orderTypeButtons[0].classList.add(
      "bg-gradient-to-r",
      "from-orange-400",
      "to-yellow-400",
      "text-white",
      "active-order-type"
    );
  }

  // Event Listeners

  // Category Buttons
  const categoryButtons = document.querySelectorAll(".category-button");
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Toggle active classes
      categoryButtons.forEach((btn) => {
        btn.classList.remove(
          "bg-gradient-to-r",
          "from-orange-400",
          "to-yellow-400",
          "text-white",
          "active-category"
        );
        btn.classList.add("bg-gray-100", "text-gray-700");
      });
      this.classList.remove("bg-gray-100", "text-gray-700");
      this.classList.add(
        "bg-gradient-to-r",
        "from-orange-400",
        "to-yellow-400",
        "text-white",
        "active-category"
      );

      // Filter menu items
      const selectedCategory = this.getAttribute("data-category");
      document.querySelectorAll(".menu-item").forEach((item) => {
        if (item.getAttribute("data-category") === selectedCategory) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  // Order Type Buttons
  const orderTypeButtons = document.querySelectorAll(".order-type");
  orderTypeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Toggle active classes
      orderTypeButtons.forEach((btn) => {
        btn.classList.remove(
          "bg-gradient-to-r",
          "from-orange-400",
          "to-yellow-400",
          "text-white",
          "active-order-type"
        );
        btn.classList.add("bg-gray-100", "text-gray-700");
      });
      this.classList.remove("bg-gray-100", "text-gray-700");
      this.classList.add(
        "bg-gradient-to-r",
        "from-orange-400",
        "to-yellow-400",
        "text-white",
        "active-order-type"
      );

      // Update selected order type
      selectedOrderType = this.getAttribute("data-type");
      calculateDiscount(selectedOrderType);
    });
  });

  // "Tambah Pesanan" Buttons
  const addToOrderButtons = document.querySelectorAll(".add-to-order");
  addToOrderButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const item = this.getAttribute("data-item");
      const price = parseInt(this.getAttribute("data-price"));
      const imageSrc =
        this.parentElement.previousElementSibling.getAttribute("src");
      const existingItemIndex = orderItems.findIndex(
        (order) => order.item === item
      );

      if (existingItemIndex > -1) {
        orderItems[existingItemIndex].quantity++;
      } else {
        orderItems.push({
          item,
          price,
          quantity: 1,
          image: imageSrc,
          note: "",
        });
      }

      updateOrderSummary();

      // Update button appearance
      if (existingItemIndex > -1) {
        updateAddToOrderButton(this, orderItems[existingItemIndex].quantity);
      } else {
        updateAddToOrderButton(this, 1);
      }
    });
  });

  // Apply Voucher Button
  applyVoucherBtn.addEventListener("click", function () {
    const voucher = voucherInput.value.trim().toUpperCase();
    applyVoucher(voucher);
  });

  // Confirm Payment Button
  confirmPaymentBtn.addEventListener("click", function () {
    if (orderItems.length === 0) {
      alert("Pesanan kosong.");
      return;
    }
    updatePaymentModal();
    paymentModal.classList.remove("hidden");
  });

  // Close Payment Modal
  closeModalBtn.addEventListener("click", function () {
    paymentModal.classList.add("hidden");
  });

  // Confirm Payment in Modal
  confirmModalPaymentBtn.addEventListener("click", function () {
    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );

    // Reset order and close modal
    resetOrder();
    paymentModal.classList.add("hidden");
  });

  // Edit Order Button
  orderSummary.addEventListener("click", function (e) {
    if (e.target.closest(".edit-order")) {
      const index = e.target.closest(".edit-order").getAttribute("data-index");
      currentEditIndex = index;
      const order = orderItems[index];

      // Set data ke dalam modal
      editOrderImage.src = order.image;
      editOrderName.textContent = order.item;
      editOrderPrice.textContent = `Rp ${order.price.toLocaleString()}`;
      orderQuantityEl.textContent = order.quantity;
      orderNoteTextarea.value = order.note || "";

      // Tampilkan modal
      editOrderModal.classList.remove("hidden");
    }

    // Hapus Order
    if (e.target.closest(".delete-order")) {
      const index = e.target
        .closest(".delete-order")
        .getAttribute("data-index");
      if (confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
        orderItems.splice(index, 1);
        updateOrderSummary();

        // Reset semua "Tambah Pesanan" buttons
        resetAddToOrderButtons();
      }
    }
  });

  // Close Edit Order Modal
  closeEditModalBtn.addEventListener("click", function () {
    editOrderModal.classList.add("hidden");
  });

  // Increase Quantity in Edit Modal
  increaseQuantityBtn.addEventListener("click", function () {
    currentQuantity++;
    orderQuantityEl.textContent = currentQuantity;
  });

  // Decrease Quantity in Edit Modal
  decreaseQuantityBtn.addEventListener("click", function () {
    if (currentQuantity > 1) {
      currentQuantity--;
      orderQuantityEl.textContent = currentQuantity;
    }
  });

  // Confirm Edit Order Modal
  confirmEditOrderBtn.addEventListener("click", function () {
    if (currentEditIndex !== null) {
      const updatedQuantity = parseInt(orderQuantityEl.textContent);
      const updatedNote = orderNoteTextarea.value.trim();

      // Update pesanan
      orderItems[currentEditIndex].quantity = updatedQuantity;
      orderItems[currentEditIndex].note = updatedNote;

      // Refresh order summary
      updateOrderSummary();

      // Reset "Tambah Pesanan" buttons
      resetAddToOrderButtons();

      // Tutup modal
      editOrderModal.classList.add("hidden");
    }
  });

  // Initial Display of All Menu Items
  function showAllMenuItems() {
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("hidden");
    });
  }

  showAllMenuItems(); // Show all items on load
});
