import _ from "lodash";

const initState = [];

export default function recipes(state = initState, action) {
  switch (action.type) {
    // ----------------------
    // Recipes

    case "RECIPE_CREATE_SUCCEEDED": {
      return state;
    }

    case "RECIPE_CREATE_FAILED": {
      return { ...state, editing: action.recipe };
    }

    case "RECIPE_FETCH_ALL": {
      return { ...state, all: action.recipes };
    }

    case "EDIT_RECIPE": {
      return { ...state, editing: action.recipe };
    }

    case "SHOW_RECIPE": {
      return { ...state, showing: action.recipe };
    }

    case "UPDATE_RECIPE": {
      const { recipe } = action;
      const recipes = _.cloneDeep(state.recipes);
      const oldRecipe = recipes.find(p => p._id === recipe._id);
      if (oldRecipe) {
        recipes.splice(recipes.indexOf(oldRecipe), 1, recipe);
      } else {
        // New recipe
        recipes.push(recipe);
      }
      return { ...state, all: recipes };
    }

    case "DELETE_RECIPE": {
      return { ...state, deleting: action.recipe };
    }

    case "DELETE_RECIPE_CONFIRM": {
      const { recipe } = action;
      const recipes = _.cloneDeep(state.recipes);
      const oldRecipe = recipes.find(p => p._id === recipe._id);
      if (oldRecipe) {
        recipes.splice(recipes.indexOf(oldRecipe), 1);
      }
      return { ...state, all: recipes };
    }

    default:
      return state;
  }
}
