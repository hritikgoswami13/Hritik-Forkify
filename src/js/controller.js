import * as model from "./model.js"
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeViews.js"
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarkView from "./views/bookmarkView.js"
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";              //for polyfilling everything else
import "regenerator-runtime/runtime"; //for polyfilling async/ await
import { async } from "regenerator-runtime";

// if(module.hot){
//   module.hot.accept();
// };

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function(){ 
  try{
   
    const id = window.location.hash.slice(1);
    // console.log(id);

    if(!id) return
    recipeView.renderSpinner();

    //0) update result view to mark selected search result
    resultsView.update(model.getSearchResultPage());
    bookmarkView.update(model.state.bookmarks);
    

    // loading data - 01
     await model.loadRecipe(id);

    // rendering recipe - 02
    recipeView.render(model.state.recipe);

     
  }
  catch(err){
   recipeView.renderError()
  }
};
const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    // console.log(resultsView)

    // 1) Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query)

    // 3) Render results
    // resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search)
  }
  catch(err){
    console.log(err)
  }
};
const controlPagination = function(goToPage){
    // 1) Render New results
    resultsView.render(model.getSearchResultPage(goToPage));

    // 2) Render New pagination buttons
    paginationView.render(model.state.search)
};
const controlServings =function(newServings){
  //update the recipe servings (in state)
  model.updateServings(newServings);
  //update the recipe view
  recipeView.update(model.state.recipe)
}
const controlAddBookmark = function(){
  //1) Add/ remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2)update the recipe view
  // console.log(model.state.recipe);
  recipeView.update(model.state.recipe);

  //3) render bookmarks
  bookmarkView.render(model.state.bookmarks)

}

const controlBookmarks = function(){
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe){
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    
    //Render Recipe
    recipeView.render(model.state.recipe)

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    //Change the id in the url, histry api takes three arguments ( state, title, url)
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC * 1000)

  } catch (err) {
    console.error("💥",err);
    addRecipeView.renderError(err.message);
    
  }
  //upload the new data
 
};

const init= function(){
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRecipe(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

}
init();
