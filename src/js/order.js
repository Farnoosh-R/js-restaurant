import "@fortawesome/fontawesome-free/css/all.min.css";
import { foods } from "./data/foods.js";

/********************TASKS*******************/
// namayeshe ghaza ha bar asase category
// entekhabe ghazaha ba checkbox
// afzayesh va kaheshe tedade item ha
// zakhire sefaresh dar localstorage
// namayesh total

// bakhshi az safe ke id menu-foods ro dashte bashe ro peida , entekhab mikone
const menuFoods = document.querySelector("#menu-foods");

// daryafte sefareshe ghabli az localstorage va tabdilesh az string b js va age ls vojud nadasht ye array khali besaz
let orderItems = JSON.parse(localStorage.getItem("orderItems")) || [];

// zakhire sefaresh
// sefaresh ro b json tabdil mikone va ba key orderItems dar ls zakhire mikone
function saveOrder() {
  localStorage.setItem("orderItems", JSON.stringify(orderItems));
}

// peida kardane tedade yek ghaza dar order
function getQuantity(foodId) {
  const item = orderItems.find((item) => item.id === foodId);
  return item ? item.quantity : 0;
}

// namayeshe tedade kole ghazahaye entekhab shode
function updateCartCount() {
  const cartCount = document.querySelector("#cart-count");

  if (!cartCount) return;

  //reduce miad tamame maghadire quantity ro a ham jam mikone dar kole array
  const count = orderItems.reduce((total, item) => total + item.quantity, 0);

  //adade total mohasebe shode ro dar safe gharar mide va ba toLocaleString("fa-IR") b surate adade farsi namayesh mide
  cartCount.textContent = count.toLocaleString("fa-IR");
}

// namayeshe ghazaha bar asase daste bandi
function renderFoods() {
  const categories = foods.reduce((result, food) => {
    if (!result[food.category]) {
      result[food.category] = [];
    }

    result[food.category].push(food);

    return result;
  }, {});

  //map mizanim roye item haye array va baraye har kodam yek section ijad mikonim
  menuFoods.innerHTML = Object.entries(categories)
    .map(
      ([category, categoryFoods]) => `
        <section class="mb-8">

          <div class="mb-6 flex items-center gap-3 border-b border-orange-400/40 pb-4">
            <i class="fa-solid fa-utensils text-xl text-orange-400"></i>

            <h2 class="text-2xl font-bold text-orange-400">
              ${category}
            </h2>
          </div>
          <!-- ghazahaye har dastebandi ro zire ham namayesh mide -->
          <div class="flex flex-col gap-6">

            ${categoryFoods
              .map((food) => {
                const quantity = getQuantity(food.id);

                return `
                  <div class="flex items-center gap-3 border-b border-white/10 pb-5">

                    <!-- Checkbox -->
                    <input
                      type="checkbox"
                      class="food-checkbox h-5 w-5 shrink-0 cursor-pointer accent-orange-400"
                      data-id="${food.id}"
                      ${quantity > 0 ? "checked" : ""}
                    />

                    <!-- Food Image -->
                    <img
                      src="${food.image}"
                      alt="${food.name}"
                      class="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />

                    <!-- Food Information -->
                    <div class="min-w-0 flex-1">

                      <h3 class="font-bold">
                        ${food.name}
                      </h3>

                      <p class="mt-2 text-xs leading-6 text-gray-400">
                        ${food.description}
                      </p>

                      <p class="mt-2 text-sm font-bold text-orange-400">
                        ${food.price.toLocaleString("fa-IR")} تومان
                      </p>

                    </div>

                    <!-- Quantity Selector -->
                    <div class="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        data-action="decrease"
                        data-id="${food.id}"
                        class="quantity-btn flex h-7 w-7 items-center justify-center rounded-full border border-orange-400 text-orange-400 transition hover:bg-orange-400 hover:text-white"
                      >
                        <i class="fa-solid fa-minus text-xs"></i>
                      </button>

                      <span class="w-5 text-center text-sm">
                        ${quantity.toLocaleString("fa-IR")}
                      </span>

                      <button
                        type="button"
                        data-action="increase"
                        data-id="${food.id}"
                        class="quantity-btn flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-white transition hover:bg-orange-500"
                      >
                        <i class="fa-solid fa-plus text-xs"></i>
                      </button>

                    </div>

                  </div>
                `;
              })
              .join("")}

          </div>
        </section>
      `,
    )
    .join("");

  updateCartCount();
}

// afzudane tedade ghaza
function increaseQuantity(foodId) {
  const food = foods.find((item) => item.id === foodId);

  if (!food) return;

  const existingItem = orderItems.find((item) => item.id === foodId);

  if (existingItem) {
    //age ghaza az ghabl ezafe shode bashe faghat tedadesh ro ziad mikone
    existingItem.quantity++;
  } else {
    //dar gheire insurat ezafe mikone b list orderItems
    orderItems.push({
      ...food,
      quantity: 1,
    });
  }

  saveOrder();
  renderFoods();
}

// kam kardane tedade ghaza
function decreaseQuantity(foodId) {

  //aval ghazaye morede nazar ro peida mikone dar list sefaresh
  const existingItem = orderItems.find((item) => item.id === foodId);

  // age ghaza vojud nadasht kari anjam nemide
  if (!existingItem) return;

  //age ghaza ro peida kar yeki az tedadesh kam mikone
  existingItem.quantity--;

  // check mikone tedade ghaza b 0 reside ya na?
  if (existingItem.quantity <= 0) {
    // age shart t bashe hame ghazaharo negah midare n joz uni k tedadesh b 0 reside yani amalan hazfesh mikone az liste sefaresh
    orderItems = orderItems.filter((item) => item.id !== foodId);
  }

  saveOrder();
  renderFoods();
}

// modiriate click btn haye + -
//inja az mafhume eventDelegation estefade kardim, yani b jaye inke n bar baraye har kodam az btn ha yek event click tarif konim 1 bar baraye kole mahdude menuFoods tarif mikonim
menuFoods.addEventListener("click", (event) => {
  //baresi mikone aya onsori k rush click shode dakhele btn ba cls quantity-btn hast ya na?
  const button = event.target.closest(".quantity-btn");
//age click ruye btn  + - nabud ejraye fn motevaghrf mishe
  if (!button) return;

  const foodId = Number(button.dataset.id);
  // type amaliat ro migire va bar un asase fn increaseQuantity ya decreaseQuantity ro ejra mikone
  const action = button.dataset.action;

  if (action === "increase") {
    increaseQuantity(foodId);
  }

  if (action === "decrease") {
    decreaseQuantity(foodId);
  }
});

// modiriate checkbox ha
//vaghti vaziate yek checkbox taghie kone in bakhsh ejra ishe
menuFoods.addEventListener("change", (event) => {
  // check mikone elemane taghir karde checkbox bashe, shayad dar ayande eleman haye dg ham ezafe koni
  // if (!event.target.classList.contains("food-checkbox")) return;

  // id marbut b un checkbox taghir karde ro migire
  const foodId = Number(event.target.dataset.id);

  //age checkbox entekhab shode bud ghaza ro b sefaresh ezafe mikone
  if (event.target.checked) {
    increaseQuantity(foodId);
  } else {
    //dar gheire insurat ghaza ro az sefaresh hazf mikone ba estefade az filter
    orderItems = orderItems.filter((item) => item.id !== foodId);

    // etelat ro save va safe ro b ruz resani mikone
    saveOrder();
    renderFoods();
  }
});

// in marbut b header va footer hast k mige vaghti layoutLoaded(header/footer) ejra shod bia mohravaye safe ro namayesh bede
document.addEventListener("layoutLoaded", () => {
  renderFoods();
});
