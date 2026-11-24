import { foods } from "./data/foods.js";

const chefFoodsContainer = document.querySelector("#chef-foods");

const chefFoods = foods.filter((food) => food.isChefSuggestion);

chefFoodsContainer.innerHTML = chefFoods
  .map(
    (food) => `
      <div class="overflow-hidden rounded-2xl bg-zinc-800 shadow-md">

     <div class="w-40 h-[150px] overflow-hidden flex justify-center items-center mx-auto"> 
      <img
          src="${food.image}"
          alt="${food.name}"
          class="object-cover"
        />
        </div>

        <div class="p-5 text-center">

          <h3 class="text-xl font-bold">
            ${food.name}
          </h3>

          <p class="mt-2 text-gray-500">
            ${food.description}
          </p>

          <p class="mt-4 font-bold text-orange-400">
            ${food.price.toLocaleString("en-US")} تومان
          </p>

        </div>

      </div>
    `,
  )
  .join("");
