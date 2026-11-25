import "@fortawesome/fontawesome-free/css/all.min.css";

const orderItemsContainer = document.querySelector("#order-items");

let orderItems = JSON.parse(localStorage.getItem("orderItems")) || [];
let appliedDiscount = null;

// ذخیره سفارش‌های موقت
function saveOrder() {
  localStorage.setItem("orderItems", JSON.stringify(orderItems));
}

// دریافت کدهای تخفیف
function getDiscountCodes() {
  return JSON.parse(localStorage.getItem("discountCodes")) || [];
}

// تاریخ امروز
function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// نمایش پیام تخفیف
function showDiscountMessage(message, type) {
  const messageElement = document.querySelector("#discount-message");

  messageElement.textContent = message;

  messageElement.className =
    type === "success"
      ? "mt-3 text-xs text-green-400"
      : "mt-3 text-xs text-red-400";
}

// اعمال کد تخفیف
function applyDiscount() {
  const code = document
    .querySelector("#discount-code")
    .value.trim()
    .toUpperCase();

  if (!code) {
    appliedDiscount = null;
    showDiscountMessage("لطفاً کد تخفیف را وارد کنید.", "error");
    renderOrderItems();
    return;
  }

  const discountCodes = getDiscountCodes();

  const discount = discountCodes.find(
    (item) => item.code.toUpperCase() === code
  );

  if (!discount) {
    appliedDiscount = null;
    showDiscountMessage("کد تخفیف معتبر نیست.", "error");
    renderOrderItems();
    return;
  }

  if (discount.active === false) {
    appliedDiscount = null;
    showDiscountMessage("این کد تخفیف غیرفعال است.", "error");
    renderOrderItems();
    return;
  }

  if (discount.expiry && discount.expiry < getToday()) {
    appliedDiscount = null;
    showDiscountMessage("مهلت استفاده از این کد تخفیف تمام شده است.", "error");
    renderOrderItems();
    return;
  }

  appliedDiscount = discount;

  showDiscountMessage(
    `${discount.percent}٪ تخفیف با موفقیت اعمال شد.`,
    "success"
  );

  renderOrderItems();
}

// نمایش سفارش‌ها
function renderOrderItems() {
  if (orderItems.length === 0) {
    appliedDiscount = null;

    orderItemsContainer.innerHTML = `
      <div class="py-16 text-center">
        <i class="fa-solid fa-basket-shopping mb-5 text-5xl text-gray-500"></i>

        <h2 class="text-xl font-bold">
          سبد سفارش شما خالی است
        </h2>

        <p class="mt-3 text-gray-400">
          هنوز غذایی به سفارش خود اضافه نکرده‌اید.
        </p>

        <a href="/order.html"
          class="mt-6 inline-block rounded-full bg-orange-400 px-8 py-3 font-bold text-white">
          مشاهده منو
        </a>
      </div>
    `;

    document.querySelector("#total-items").textContent = "۰";
    document.querySelector("#total-price").textContent = "۰ تومان";
    document.querySelector("#discount-amount").textContent = "۰ تومان";
    document.querySelector("#final-price").textContent = "۰ تومان";

    return;
  }

  // نمایش غذاها
  orderItemsContainer.innerHTML = orderItems
    .map(
      (item) => `
        <div class="mb-5 flex items-center gap-4 border-b border-white/10 pb-5">

          <img
            src="${item.image}"
            alt="${item.name}"
            class="h-24 w-24 rounded-xl object-cover"
          />

          <div class="flex-1">
            <h3 class="font-bold">${item.name}</h3>

            <p class="mt-2 font-bold text-orange-400">
              ${(item.price * item.quantity).toLocaleString("fa-IR")} تومان
            </p>

            <div class="mt-3 flex items-center gap-3">

              <button
                type="button"
                data-action="decrease"
                data-id="${item.id}"
                class="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400 text-orange-400"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>

              <span class="text-sm">
                ${item.quantity.toLocaleString("fa-IR")}
              </span>

              <button
                type="button"
                data-action="increase"
                data-id="${item.id}"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-white"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>

            </div>
          </div>

          <button
            type="button"
            data-action="remove"
            data-id="${item.id}"
            class="text-gray-500 transition hover:text-red-500"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>
      `
    )
    .join("");

  // محاسبه تعداد و مبلغ کل
  const totalItems = orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // محاسبه تخفیف
  const discountPercent = appliedDiscount
    ? appliedDiscount.percent
    : 0;

  const discountAmount = totalPrice * discountPercent / 100;

  const finalPrice = totalPrice - discountAmount;

  // نمایش مبالغ
  document.querySelector("#total-items").textContent =
    totalItems.toLocaleString("fa-IR");

  document.querySelector("#total-price").textContent =
    `${totalPrice.toLocaleString("fa-IR")} تومان`;

  document.querySelector("#discount-amount").textContent =
    `${discountAmount.toLocaleString("fa-IR")} تومان`;

  document.querySelector("#final-price").textContent =
    `${finalPrice.toLocaleString("fa-IR")} تومان`;
}

// تغییر تعداد غذا
function updateQuantity(foodId, action) {
  const item = orderItems.find(
    (item) => item.id === foodId
  );

  if (!item) return;

  if (action === "increase") {
    item.quantity++;
  }

  if (action === "decrease") {
    item.quantity--;

    if (item.quantity <= 0) {
      orderItems = orderItems.filter(
        (item) => item.id !== foodId
      );
    }
  }

  saveOrder();
  renderOrderItems();
}

// حذف غذا
function removeItem(foodId) {
  orderItems = orderItems.filter(
    (item) => item.id !== foodId
  );

  saveOrder();
  renderOrderItems();
}

// مدیریت کلیک‌های سبد سفارش
orderItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const foodId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase" || action === "decrease") {
    updateQuantity(foodId, action);
  }

  if (action === "remove") {
    removeItem(foodId);
  }
});

// کلیک روی دکمه اعمال تخفیف
document
  .querySelector("#apply-discount")
  .addEventListener("click", applyDiscount);

  // ثبت سفارش نهایی
function submitOrder() {
  if (orderItems.length === 0) {
    alert("سبد سفارش شما خالی است.");
    return;
  }

  // محاسبه تعداد غذاها
  const totalItems = orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // محاسبه مبلغ کل
  const totalPrice = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // محاسبه تخفیف
  const discountPercent = appliedDiscount
    ? appliedDiscount.percent
    : 0;

  const discountAmount = totalPrice * discountPercent / 100;

  const finalPrice = totalPrice - discountAmount;

  // دریافت سفارش‌های قبلی
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  // ساخت سفارش جدید
  const newOrder = {
    id: Date.now(),
    items: orderItems.map((item) => ({ ...item })),
    totalItems,
    totalPrice,
    discountCode: appliedDiscount ? appliedDiscount.code : null,
    discountPercent,
    discountAmount,
    finalPrice,
    createdAt: new Date().toISOString(),
    status: "در انتظار بررسی",
  };

  // ذخیره سفارش
  orders.push(newOrder);

  localStorage.setItem("orders", JSON.stringify(orders));

  // خالی کردن سبد خرید
  orderItems = [];
  saveOrder();

  appliedDiscount = null;

  renderOrderItems();

  alert("سفارش شما با موفقیت ثبت شد.");
}

// اتصال دکمه ثبت سفارش
document
  .querySelector("#continue-order")
  .addEventListener("click", submitOrder);

// اجرای اولیه
document.addEventListener("layoutLoaded", () => {
  renderOrderItems();
});