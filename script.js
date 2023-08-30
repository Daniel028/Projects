const randMealEl = document.getElementById('rand-recipe-cont');
const mealInfoEl = document.getElementById('meal-info-cont');
const mealCont = document.getElementById('meal-cont');
const searchBarEl = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');

getRandomMeal();
fetchMealToCont();
// searchMeal();

async function getRandomMeal() {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php'); // Fetch data from an API
      const data = await response.json(); // Parse response data as JSON
      const randomMeal = data.meals[0];
      addmeal(randomMeal, true); // Log the retrieved data
    } catch (error) {
      console.log("Error fetching of data: ", error);
    }
}

async function getMealByTerm(term) {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+ term)
    const data = await response.json()
    return data.meals;
  } catch (error) {
    console.log("Error fetching of data: ", error);
  }
}

async function getMealById(id) {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const data = await response.json();
    return data.meals[0];
  } catch (error) {
    console.log("Error fetching of data: ", error);
  }
}

function addmeal(mealData, random = false) {
  const mealIds = getMealLs();
  const mealId = mealData.idMeal;
  const randomRecipe = document.createElement('div');
  randomRecipe.classList.add('rand-recipe')
  randomRecipe.id = 'meal';
  randomRecipe.innerHTML = `
        <div class="meal-thumb-img">
          <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="meal-image">
          ${random ? '<span class="label-random-rec">Random Recipe</span>' : ''}
        </div>
        <div class="meal-info">
          <h4 class="label-meal-name">${mealData.strMeal}</h4>
          <button class="add-to-fav-btn ${mealIds.includes(mealId) ? 'active' : ''}" title="add to favorites"><i class="fa-solid fa-heart"></i></button>
        </div>
      </div>
  `;

  const addFavBtn = randomRecipe.querySelector('.add-to-fav-btn');
  addFavBtn.addEventListener('click', (event) => {
    if (addFavBtn.classList.contains('active')) {
      removeMealLs(mealData.idMeal);
      addFavBtn.classList.remove('active');
    } else {
      addMealLs(mealData.idMeal);
      addFavBtn.classList.add('active');
    }
    event.stopPropagation();
    fetchMealToCont();
  });

  randomRecipe.addEventListener('click', ()=> {
    if (mealInfoEl.classList.contains('hidden')) {
      showMeal(mealData);
      mealInfoEl.classList.remove('hidden');
    } 
  })
  randMealEl.appendChild(randomRecipe);
}

function addMealLs(mealId) {
  const mealIds = getMealLs();
  localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

function removeMealLs(mealId) {
  const mealIds = getMealLs();
  localStorage.setItem(
    'mealIds', 
    JSON.stringify(mealIds.filter((id)=>id!==mealId))
  );
}
function getMealLs() {
  const mealIds = JSON.parse(localStorage.getItem('mealIds'));
  return mealIds === null ? [] : mealIds;
}

async function fetchMealToCont() {
  mealCont.innerHTML='';
  const mealIds = getMealLs();
  if (mealIds.length === 0) {
    mealCont.innerHTML = `<div id="no-fav-label" class="label">Click Heart Button to Add to Favorites</div>`;
    mealCont.style.justifyContent = "center"
  } else {
    for (let i=0; i<mealIds.length; i++) {
      // console.log(mealIds[i]);
      const mealId = mealIds[i];
      const meal = await getMealById(mealId);
      addMealFav(meal);
    }
    mealCont.style.justifyContent = "start"
  }

}

function addMealFav(mealData) {
  const mealCont = document.getElementById('meal-cont');
  const meal = document.createElement('div');
  meal.classList.add('meal');
  meal.setAttribute("title", `${mealData.strMeal}`)
  meal.innerHTML = `
    <div class="meal-pic">
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="meal-logo">
      <button class="del-logo" title="remove"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="fav-meal-name" >${mealData.strMeal}</div>
  `;
  const delBtn = meal.querySelector('.del-logo');

  delBtn.addEventListener('click', (event) => {

    removeMealLs(mealData.idMeal);
    fetchMealToCont();
    event.stopPropagation();
  });
  meal.addEventListener('click', ()=> {
    showMeal(mealData);
    if (mealInfoEl.classList.contains('hidden')) {
      mealInfoEl.classList.remove('hidden');
    }
  })
  mealCont.appendChild(meal);
}

function showMeal(mealData) {
  mealInfoEl.innerHTML = '';
  const popUpEl = document.createElement('div');
  popUpEl.classList.add('popup-info');
  const ingredients = [];
  for (let i = 1; i<=20; i++) {
    if(mealData[`strIngredient${i}`]) {
      ingredients.push(`${mealData[`strIngredient${i}`]} - ${mealData[`strMeasure${i}`]}`);
    } else {  
      break;
    }
  }

  popUpEl.innerHTML = `
    <div class="title-img-cont">
      <h3 class="meal-title">${mealData.strMeal}</h3>
      <button class="close-popup"><i class="fa-solid fa-xmark"></i></button>
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="info-meal-img">
    </div>

    <div class="instruction-cont">
      <h4>Instructions:</h4>
      <p class="instruction">
        ${mealData.strInstructions}
      </p>
    </div>

    <div class="ingredients-measures-cont">
      <h4>Ingredients and Measurement:</h4>
      <ul class="ingredients-measures">
        ${ingredients.map((ingredient) => {return `<li>${ingredient}</li>`}).join("")}
      </ul>
    </div>
  `
  const closePopUpBtn = popUpEl.querySelector('.close-popup');
  closePopUpBtn.addEventListener('click', () => {
    mealInfoEl.classList.add('hidden');
  })
  console.log();
  mealInfoEl.appendChild(popUpEl);
}


searchBarEl.addEventListener('keydown', async (event) => {
  if (event.key == 'Enter') {
    const term = searchBarEl.value;
    if (term === '') {
      randMealEl.innerHTML = "";
      getRandomMeal();
      return;
    }
    meals = await getMealByTerm(term);
    randMealEl.innerHTML = '';
    if (meals === null) {
      randMealEl.innerHTML = `<div class="label">No ${term} found</div>`;
    } else {
      meals.forEach((meal)=> {
        addmeal(meal);
      })
    }
  }
})
searchBtn.addEventListener('click', async () => {
  const term = searchBarEl.value;
  if (term === '') {
    randMealEl.innerHTML = "";
    getRandomMeal();
    return;
  }
  meals = await getMealByTerm(term);
  randMealEl.innerHTML = '';
  if (meals === null) {
    randMealEl.innerHTML = `<div class="label">No meal recipe found</div>`;
  } else {
    meals.forEach((meal)=> {
      addmeal(meal);
      console.log(meal);
    })
  }

})

