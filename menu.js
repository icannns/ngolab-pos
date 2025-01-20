// Menangani Daftar Pesanan
let orderList = [];
const orderContainer = document.querySelector(".flex-1.overflow-y-auto .p-4");
const totalPaymentElement = document.querySelector(
  ".flex.justify-between.font-medium.text-base span:last-child"
);

// Fungsi untuk Menambahkan Pesanan
function addOrder(itemName, itemPrice) {
  const existingOrder = orderList.find((order) => order.name === itemName);
  if (existingOrder) {
    existingOrder.quantity += 1;
  } else {
    orderList.push({
      name: itemName,
      price: itemPrice,
      quantity: 1,
    });
  }
  renderOrders();
}

// Fungsi untuk Menghapus Pesanan
function removeOrder(itemName) {
  orderList = orderList.filter((order) => order.name !== itemName);
  renderOrders();
}

// Fungsi untuk Merender Daftar Pesanan
function renderOrders() {
  orderContainer.innerHTML = ""; // Bersihkan daftar pesanan
  let totalPrice = 0;

  orderList.forEach((order) => {
    totalPrice += order.price * order.quantity;

    const orderHTML = `
      <div class="flex items-center border border-gray-300 rounded-lg p-2 shadow-sm">
        <div class="ml-4 flex-1">
          <h3 class="font-medium text-lg">
            ${order.name} <span class="text-gray-500 font-medium">(${order.quantity})</span>
          </h3>
          <p class="text-gray-500">Rp ${order.price * order.quantity}</p>
          <button
            class="text-red-500 hover:text-red-700 transition"
            onclick="removeOrder('${order.name}')"
          >
            Hapus
          </button>
        </div>
      </div>
    `;
    orderContainer.innerHTML += orderHTML;
  });

  // Update total pembayaran
  totalPaymentElement.textContent = `Rp ${totalPrice}`;
}

// Fungsi untuk Konfirmasi Pembayaran
function confirmPayment() {
  if (orderList.length === 0) {
    alert("Tidak ada pesanan. Tambahkan pesanan terlebih dahulu.");
    return;
  }

  const totalPrice = orderList.reduce(
    (total, order) => total + order.price * order.quantity,
    0
  );

  const confirmation = confirm(
    `Konfirmasi pembayaran dengan total Rp ${totalPrice}. Apakah Anda yakin?`
  );

  if (confirmation) {
    alert("Pembayaran berhasil. Terima kasih!");
    orderList = [];
    renderOrders();
  }
}

// Menambahkan Event Listener ke Tombol "Tambah Pesanan"
document.querySelectorAll(".btn-tambah").forEach((button) => {
  button.addEventListener("click", (event) => {
    const itemName = event.target.dataset.name;
    const itemPrice = parseInt(event.target.dataset.price);
    addOrder(itemName, itemPrice);
  });
});

// Menambahkan Event Listener ke Tombol "Confirm Payment"
document
  .querySelector(".btn-confirm-payment")
  .addEventListener("click", confirmPayment);
