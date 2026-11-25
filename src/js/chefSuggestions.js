import { foods as initialFoods } from "./data/foods.js";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const chefFoodsContainer = document.querySelector("#chef-foods");

// دریافت غذاها از localStorage
const savedFoods = localStorage.getItem("foods");

const foods = savedFoods ? JSON.parse(savedFoods) : initialFoods;

// فیلتر پیشنهادهای سرآشپز
const chefFoods = foods;

// نمایش غذاها
chefFoodsContainer.innerHTML = chefFoods
  .map(
    (food) => `
      <div class="swiper-slide overflow-hidden rounded-2xl bg-zinc-800 shadow-md pt-2">
      

        <div class="mx-auto flex h-[150px] w-40 items-center justify-center overflow-hidden rounded-full">
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

      <p class="mt-2 line-clamp-3 min-h-[72px] text-gray-500">
  ${food.description || ""}
</p>

          <p class="mt-4 font-bold text-orange-400">
            ${food.price.toLocaleString("en-US")} تومان
          </p>

        </div>

      </div>
    `,
  )
  .join("");
// راه‌اندازی اسلایدر
const chefSwiper = new Swiper(".chefSwiper", {
  modules: [Autoplay, Navigation, Pagination],

  slidesPerView: 1,
  spaceBetween: 20,

  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
  },

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 4,
    },
  },
});
