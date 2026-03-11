// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");
const randomBtn = document.getElementById("random-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

const areaToCode = {
    American: "us",
    British: "gb",
    Canadian: "ca",
    Chinese: "cn",
    Croatian: "hr",
    Dutch: "nl",
    Egyptian: "eg",
    Filipino: "ph",
    French: "fr",
    Greek: "gr",
    Indian: "in",
    Irish: "ie",
    Italian: "it",
    Jamaican: "jm",
    Japanese: "jp",
    Kenyan: "ke",
    Malaysian: "my",
    Mexican: "mx",
    Moroccan: "ma",
    Norwegian: "no",
    Polish: "pl",
    Portuguese: "pt",
    Russian: "ru",
    Spanish: "es",
    Thai: "th",
    Tunisian: "tn",
    Turkish: "tr",
    Ukrainian: "ua",
    Vietnamese: "vn"
};

searchBtn.addEventListener("click", searchMeals);
searchInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") searchMeals();
})

randomBtn.addEventListener("click", showRandomRecipe);

mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));

async function searchMeals() {
    const searchTerm = searchInput.value.trim();

    // empty input case
    if(!searchTerm) {
        errorContainer.textContent = "Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    }

    try {
        resultHeading.textContent = `Searching for "${searchTerm}"...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        // fetch meals from api
        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        const data = await response.json();

        console.log("data is here:", data);
        if(data.meals === null) {
            // no meals found
            resultHeading.textContent = "";
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term.`;
            errorContainer.classList.remove("hidden");
        }
        else {
            resultHeading.textContent = `Search results for "${searchTerm}":`;
            displayMeals(data.meals);
            searchInput.value = "";
        }
    } catch (error) {
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

function displayMeals(meals) {
    mealsContainer.innerHTML = "";

    // if one meal center it (for random meal)
    if (meals.length === 1) {
        mealsContainer.classList.add("single-meal");
    } else {
        mealsContainer.classList.remove("single-meal");
    }

    // loop through meals and create a card for each meal 
    meals.forEach((meal) => {
        mealsContainer.innerHTML += `
        <div class="meal" data-meal-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3 class="meal-title">${meal.strMeal}</h3>
                ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
            </div>
        </div>
        `;
    });
}

async function handleMealClick(e) {
    const mealElement = e.target.closest(".meal");
    if(!mealElement) return;

    const mealId = mealElement.getAttribute("data-meal-id");

    try {
        const response = await fetch(`${LOOKUP_URL}${mealId}`);
        const data = await response.json();

        console.log(data);
        showRecipeDetails(data);
        
    } catch (error) {
        errorContainer.textContent = "Could not load recipe details. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

function showRecipeDetails(data) {
    if (data.meals && data.meals[0]) {
        const meal = data.meals[0];

        const countryCode = areaToCode[meal.strArea];
        const flagURL = countryCode
            ? `https://flagcdn.com/24x18/${countryCode}.png`
            : "";

        const ingredients = [];

        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
                ingredients.push({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`]
                });
            }
        }

        // display meal details
        mealDetailsContent.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
        <h2 class="meal-details-title">${meal.strMeal}</h2>
        <div class="meal-details-category">
            <span>${meal.strCategory || "Uncategorized"}</span>
            ${meal.strArea ? `
                <span class="meal-area">
                    <img src="${flagURL}" alt="${meal.strArea} flag">
                    ${meal.strArea}
                </span>
            ` : ""}
        </div>
        <div class="meal-details-instructions">
            <h3>Instructions</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="meal-details-ingredients">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
                ${ingredients.map((item) =>
            `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`
        ).join("")
            }
            </ul >
        </div >
        <div>
            ${meal.strYoutube
                ? ` 
                <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                    <i class="fab fa-youtube"></i> Watch Video
                </a>
                `
                : ""
            }
        </div>
        `;

        mealDetails.classList.remove("hidden");
        mealDetails.scrollIntoView({ behavior: "smooth" });
    }
}

async function showRandomRecipe() {
    try {
        resultHeading.textContent = `Searching for a random recipe...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        // fetch random meal from api
        const response = await fetch(`${BASE_URL}random.php`);
        const data = await response.json();

        console.log("random recipe:", data);
        resultHeading.textContent = `Random recipe is selected:`;
        displayMeals(data.meals);

    } catch (error) {
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}
