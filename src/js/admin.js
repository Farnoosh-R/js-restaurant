import "@fortawesome/fontawesome-free/css/all.min.css";
import { foods as initialFoods } from "./data/foods.js";

const discountForm = document.querySelector("#discount-form");
const discountList = document.querySelector("#discount-list");
const discountSubmit = document.querySelector("#discount-submit");
const cancelEdit = document.querySelector("#cancel-edit");

let discountCodes = JSON.parse(localStorage.getItem("discountCodes")) || [];
let editingDiscountId = null;

// ذخیره کدهای تخفیف
function saveDiscountCodes() {
  localStorage.setItem("discountCodes", JSON.stringify(discountCodes));
}

// جلوگیری از نمایش HTML واردشده توسط کاربر
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

// نمایش کدهای تخفیف
function renderDiscountCodes() {
  if (discountCodes.length === 0) {
    discountList.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-400">
          هنوز کد تخفیفی ثبت نشده است.
        </td>
      </tr>
    `;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  discountList.innerHTML = discountCodes
    .map((discount) => {
      const isExpired = discount.expiry && discount.expiry < today;
      const isActive = discount.active !== false && !isExpired;

      return `
      <tr class="border-b border-white/10">
        <td class="p-4">${escapeHTML(discount.title)}</td>

        <td class="p-4 font-bold text-orange-400">
          ${escapeHTML(discount.code)}
        </td>

        <td class="p-4">
          ${discount.percent.toLocaleString("fa-IR")}٪
        </td>

        <td class="p-4">
          ${
            discount.expiry
              ? new Date(discount.expiry + "T00:00:00").toLocaleDateString(
                  "fa-IR",
                )
              : "بدون تاریخ انقضا"
          }
        </td>

        <td class="p-4">
          ${
            isExpired
              ? '<span class="text-red-400">منقضی شده</span>'
              : isActive
                ? '<span class="text-green-400">فعال</span>'
                : '<span class="text-gray-400">غیرفعال</span>'
          }
        </td>

        <td class="p-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              data-edit="${discount.id}"
              class="text-blue-400 hover:text-blue-300"
              title="ویرایش"
            >
              <i class="fa-solid fa-pen"></i>
            </button>

            <button
              type="button"
              data-toggle="${discount.id}"
              class="text-yellow-400 hover:text-yellow-300"
              title="${discount.active === false ? "فعال کردن" : "غیرفعال کردن"}"
              ${isExpired ? "disabled" : ""}
            >
              <i class="fa-solid ${discount.active === false ? "fa-toggle-off" : "fa-toggle-on"}"></i>
            </button>

            <button
              type="button"
              data-delete="${discount.id}"
              class="text-red-400 hover:text-red-300"
              title="حذف"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

// پاک کردن فرم و خروج از حالت ویرایش
function resetForm() {
  discountForm.reset();
  editingDiscountId = null;

  discountSubmit.textContent = "ثبت کد تخفیف";
  cancelEdit.classList.add("hidden");
}

// ثبت یا ویرایش کد تخفیف
discountForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.querySelector("#discount-title").value.trim();
  const code = document
    .querySelector("#discount-code")
    .value.trim()
    .toUpperCase();
  const percent = Number(document.querySelector("#discount-percent").value);
  const expiry = document.querySelector("#discount-expiry").value;

  if (!title || !code || !percent) {
    alert("لطفاً اطلاعات ضروری را وارد کنید.");
    return;
  }

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    alert("کد تخفیف باید شامل حروف انگلیسی، عدد، خط تیره یا زیرخط باشد.");
    return;
  }

  if (percent < 1 || percent > 100) {
    alert("درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.");
    return;
  }

  const isDuplicate = discountCodes.some(
    (discount) => discount.code === code && discount.id !== editingDiscountId,
  );

  if (isDuplicate) {
    alert("این کد تخفیف قبلاً ثبت شده است.");
    return;
  }

  if (editingDiscountId !== null) {
    discountCodes = discountCodes.map((discount) =>
      discount.id === editingDiscountId
        ? { ...discount, title, code, percent, expiry }
        : discount,
    );

    alert("کد تخفیف با موفقیت ویرایش شد.");
  } else {
    discountCodes.push({
      id: Date.now(),
      title,
      code,
      percent,
      expiry,
      active: true,
    });

    alert("کد تخفیف با موفقیت ثبت شد.");
  }

  saveDiscountCodes();
  renderDiscountCodes();
  resetForm();
  updateDashboard();
});

// مدیریت عملیات جدول
discountList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const toggleButton = event.target.closest("[data-toggle]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const id = Number(editButton.dataset.edit);
    const discount = discountCodes.find((item) => item.id === id);

    if (!discount) return;

    document.querySelector("#discount-title").value = discount.title;
    document.querySelector("#discount-code").value = discount.code;
    document.querySelector("#discount-percent").value = discount.percent;
    document.querySelector("#discount-expiry").value = discount.expiry || "";

    editingDiscountId = id;

    discountSubmit.textContent = "ذخیره تغییرات";
    cancelEdit.classList.remove("hidden");

    discountForm.scrollIntoView({ behavior: "smooth" });
  }

  if (toggleButton && !toggleButton.disabled) {
    const id = Number(toggleButton.dataset.toggle);

    discountCodes = discountCodes.map((discount) =>
      discount.id === id
        ? { ...discount, active: discount.active === false }
        : discount,
    );

    saveDiscountCodes();
    renderDiscountCodes();
    updateDashboard();
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.delete);

    if (!confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) return;

    discountCodes = discountCodes.filter((discount) => discount.id !== id);

    saveDiscountCodes();
    renderDiscountCodes();
    updateDashboard();

    if (editingDiscountId === id) {
      resetForm();
    }
  }
});

// انصراف از ویرایش
cancelEdit.addEventListener("click", resetForm);

// نمایش اولیه
renderDiscountCodes();

// ***************************
// مدیریت غذاها
// ***************************

const foodForm = document.querySelector("#food-form");
const foodList = document.querySelector("#food-list");
const foodSubmit = document.querySelector("#food-submit");
const cancelFoodEdit = document.querySelector("#cancel-food-edit");

// دریافت غذاها از localStorage
const savedFoods = localStorage.getItem("foods");

let foodItems = savedFoods ? JSON.parse(savedFoods) : [...initialFoods];

// اگر برای اولین بار وارد پنل شده‌ایم، غذاهای اولیه را ذخیره کن
if (!savedFoods) {
  localStorage.setItem("foods", JSON.stringify(foodItems));
}

let editingFoodId = null;

// ذخیره غذاها
function saveFoods() {
  localStorage.setItem("foods", JSON.stringify(foodItems));
}

// نمایش غذاها
function renderFoods() {
  if (foodItems.length === 0) {
    foodList.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-400">
          هنوز غذایی ثبت نشده است.
        </td>
      </tr>
    `;
    return;
  }

  foodList.innerHTML = foodItems
    .map(
      (food) => `
    <tr class="border-b border-white/10">

      <td class="p-4">
        <img
          src="${escapeHTML(food.image)}"
          alt="${escapeHTML(food.name)}"
          class="h-14 w-14 rounded-lg object-cover"
        />
      </td>

      <td class="p-4 font-medium">
        ${escapeHTML(food.name)}
      </td>

      <td class="p-4 text-gray-400">
        ${escapeHTML(food.category)}
      </td>

      <td class="p-4 text-orange-400">
        ${Number(food.price).toLocaleString("fa-IR")} تومان
      </td>

      <td class="p-4">
        ${
          food.isChefSuggestion
            ? '<span class="text-green-400">بله</span>'
            : '<span class="text-gray-400">خیر</span>'
        }
      </td>

      <td class="p-4">
        <div class="flex items-center gap-3">

          <button
            type="button"
            data-edit-food="${food.id}"
            class="text-blue-400 hover:text-blue-300"
            title="ویرایش"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            type="button"
            data-delete-food="${food.id}"
            class="text-red-400 hover:text-red-300"
            title="حذف"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>
      </td>

    </tr>
  `,
    )
    .join("");
}

// پاک کردن فرم
function resetFoodForm() {
  foodForm.reset();

  editingFoodId = null;

  foodSubmit.textContent = "ثبت غذا";
  cancelFoodEdit.classList.add("hidden");
}

// ثبت یا ویرایش غذا
foodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#food-name").value.trim();
  const category = document.querySelector("#food-category").value.trim();
  const price = Number(document.querySelector("#food-price").value);
  const image = document.querySelector("#food-image").value.trim();
  const description = document.querySelector("#food-description").value.trim();

  if (!name || !category || !image || !description || price < 0) {
    alert("لطفاً تمام اطلاعات غذا را به‌درستی وارد کنید.");
    return;
  }

  if (editingFoodId !== null) {
    // ویرایش غذای قبلی
    foodItems = foodItems.map((food) =>
      food.id === editingFoodId
        ? {
            ...food,
            name,
            category,
            price,
            image,
            description,
            isChefSuggestion: true,
          }
        : food,
    );

    alert("اطلاعات غذا با موفقیت ویرایش شد.");
  } else {
    // افزودن غذای جدید
    const newFood = {
      id: Date.now(),
      name,
      category,
      price,
      image,
      description,
      isChefSuggestion: true,
    };

    foodItems.push(newFood);

    alert("غذای جدید با موفقیت ثبت شد.");
  }

  saveFoods();
  renderFoods();
  resetFoodForm();
  updateDashboard();
});

// مدیریت کلیک‌های جدول غذاها
foodList.addEventListener("click", (event) => {
  // دکمه ویرایش
  const editButton = event.target.closest("[data-edit-food]");

  if (editButton) {
    const id = Number(editButton.dataset.editFood);

    const food = foodItems.find((item) => item.id === id);

    if (!food) return;

    document.querySelector("#food-name").value = food.name;
    document.querySelector("#food-category").value = food.category;
    document.querySelector("#food-price").value = food.price;
    document.querySelector("#food-image").value = food.image;
    document.querySelector("#food-description").value = food.description;

    // document.querySelector("#food-chef-suggestion").checked =
    //   Boolean(food.isChefSuggestion);

    editingFoodId = id;

    foodSubmit.textContent = "ذخیره تغییرات";
    cancelFoodEdit.classList.remove("hidden");

    foodForm.scrollIntoView({ behavior: "smooth" });
  }

  // دکمه حذف
  const deleteButton = event.target.closest("[data-delete-food]");

  if (deleteButton) {
    const id = Number(deleteButton.dataset.deleteFood);

    if (!confirm("آیا از حذف این غذا مطمئن هستید؟")) return;

    foodItems = foodItems.filter((food) => food.id !== id);

    saveFoods();
    renderFoods();
    updateDashboard();

    if (editingFoodId === id) {
      resetFoodForm();
    }

    alert("غذا با موفقیت حذف شد.");
  }
});

// انصراف از ویرایش
cancelFoodEdit.addEventListener("click", resetFoodForm);

// نمایش اولیه غذاها
renderFoods();

// ***************************
// مدیریت سفارش‌ها
// ***************************

const orderList = document.querySelector("#order-list");

// دریافت سفارش‌های ثبت‌شده
let adminOrders = JSON.parse(localStorage.getItem("orders")) || [];

// وضعیت‌های سفارش
const orderStatuses = [
  "در انتظار بررسی",
  "در حال آماده‌سازی",
  "تکمیل‌شده",
  "لغوشده",
];

// محاسبه گزارش مالی سفارش‌ها
function renderOrderReport() {
  const startDate = document.querySelector("#report-start-date").value;
  const endDate = document.querySelector("#report-end-date").value;

  // بررسی معتبر بودن بازه تاریخ
  if (startDate && endDate && startDate > endDate) {
    return;
  }

  // فیلتر سفارش‌ها بر اساس تاریخ
  const filteredOrders = adminOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, "0");
    const day = String(orderDate.getDate()).padStart(2, "0");

    const date = `${year}-${month}-${day}`;

    const afterStart = !startDate || date >= startDate;
    const beforeEnd = !endDate || date <= endDate;

    return afterStart && beforeEnd;
  });

  // محاسبه مجموع مبلغ هر وضعیت
  const totals = {
    "در انتظار بررسی": 0,
    "در حال آماده‌سازی": 0,
    "تکمیل‌شده": 0,
    "لغوشده": 0,
  };

  filteredOrders.forEach((order) => {
    if (totals[order.status] !== undefined) {
      totals[order.status] += Number(order.finalPrice) || 0;
    }
  });

  // محاسبه مجموع کل
  const total = Object.values(totals).reduce(
    (sum, price) => sum + price,
    0
  );

  // نمایش مبالغ
  document.querySelector("#report-pending").textContent =
    `${totals["در انتظار بررسی"].toLocaleString("fa-IR")} تومان`;

  document.querySelector("#report-preparing").textContent =
    `${totals["در حال آماده‌سازی"].toLocaleString("fa-IR")} تومان`;

  document.querySelector("#report-completed").textContent =
    `${totals["تکمیل‌شده"].toLocaleString("fa-IR")} تومان`;

  document.querySelector("#report-cancelled").textContent =
    `${totals["لغوشده"].toLocaleString("fa-IR")} تومان`;

  document.querySelector("#report-total").textContent =
    `${total.toLocaleString("fa-IR")} تومان`;
}
// به‌روزرسانی گزارش با تغییر تاریخ
document
  .querySelector("#report-start-date")
  .addEventListener("change", renderOrderReport);

document
  .querySelector("#report-end-date")
  .addEventListener("change", renderOrderReport);

// نمایش سفارش‌ها
function renderOrders() {
  if (adminOrders.length === 0) {
    orderList.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-gray-400">
          هنوز سفارشی ثبت نشده است.
        </td>
      </tr>
    `;
    return;
  }

  orderList.innerHTML = adminOrders
    .map((order) => {
      const itemsSummary = order.items
        .map((item) => `${escapeHTML(item.name)} × ${item.quantity}`)
        .join("، ");

      const orderDate = new Date(order.createdAt).toLocaleString("fa-IR");

      return `
      <tr class="border-b border-white/10">

        <td class="p-4 font-bold text-orange-400">
          #${order.id}
        </td>

        <td class="max-w-[250px] p-4 text-gray-300">
          ${itemsSummary}
        </td>

        <td class="p-4">
          ${order.totalItems.toLocaleString("fa-IR")}
        </td>

        <td class="p-4 font-bold text-orange-400">
          ${order.finalPrice.toLocaleString("fa-IR")} تومان
        </td>

        <td class="p-4 text-gray-400">
          ${orderDate}
        </td>

        <td class="p-4">
          <select
            data-order-status="${order.id}"
            class="rounded-lg border border-white/10 bg-[var(--color-bg)] px-3 py-2 text-xs text-white outline-none focus:border-orange-400"
          >
            ${orderStatuses
              .map(
                (status) => `
              <option
                value="${status}"
                ${order.status === status ? "selected" : ""}
              >
                ${status}
              </option>
            `,
              )
              .join("")}
          </select>
        </td>

        <td class="p-4">
          <button
            type="button"
            data-order-detail="${order.id}"
            class="text-blue-400 transition hover:text-blue-300"
          >
            مشاهده جزئیات
          </button>
        </td>

      </tr>
    `;
    })
    .join("");
}

// تغییر وضعیت سفارش
orderList.addEventListener("change", (event) => {
  const select = event.target.closest("[data-order-status]");

  if (!select) return;

  const orderId = Number(select.dataset.orderStatus);

  adminOrders = adminOrders.map((order) =>
    order.id === orderId ? { ...order, status: select.value } : order,
  );

localStorage.setItem("orders", JSON.stringify(adminOrders));

renderOrderReport();

alert("وضعیت سفارش تغییر کرد.");
});

// مشاهده جزئیات سفارش
orderList.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-order-detail]");

  if (!detailButton) return;

  const orderId = Number(detailButton.dataset.orderDetail);

  const order = adminOrders.find((item) => item.id === orderId);

  if (!order) return;

  const itemsDetails = order.items
    .map(
      (item) =>
        `${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString("fa-IR")} تومان`,
    )
    .join("\n");

  const details = `
شماره سفارش: ${order.id}

اقلام سفارش:
${itemsDetails}

مبلغ کل: ${order.totalPrice.toLocaleString("fa-IR")} تومان
کد تخفیف: ${order.discountCode || "ندارد"}
مبلغ تخفیف: ${order.discountAmount.toLocaleString("fa-IR")} تومان
مبلغ نهایی: ${order.finalPrice.toLocaleString("fa-IR")} تومان

وضعیت: ${order.status}
  `;

  alert(details);
});

// نمایش اولیه سفارش‌ها
renderOrders();
renderOrderReport();

// مدیریت منوی سایدبار
const sidebarLinks = document.querySelectorAll(".sidebar-link");

function setActiveSidebarLink() {
  const currentHash = window.location.hash || "#dashboard";

  sidebarLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === currentHash;

    link.classList.toggle("bg-orange-400/10", isActive);
    link.classList.toggle("text-orange-400", isActive);
  });
}

sidebarLinks.forEach((link) => {
  link.addEventListener("click", setActiveSidebarLink);
});

window.addEventListener("hashchange", setActiveSidebarLink);

setActiveSidebarLink();

/**************نمایش اطلاعات در داشبورد************/
function updateDashboard() {
  const foods = JSON.parse(localStorage.getItem("foods")) || [];
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const discounts = JSON.parse(localStorage.getItem("discountCodes")) || [];

  document.querySelector("#dashboard-food-count").textContent = foods.length;
  document.querySelector("#dashboard-order-count").textContent = orders.length;
  document.querySelector("#dashboard-discount-count").textContent =
    discounts.length;
}

updateDashboard();
