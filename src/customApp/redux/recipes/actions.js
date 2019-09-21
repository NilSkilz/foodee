const actions = {
  RECIPE_CREATE: 'RECIPE_CREATE',
  RECIPE_UPDATE: 'RECIPE_UPDATE',
  addRecipe: recipe => ({
    type: actions.RECIPE_CREATE,
    payload: { recipe: recipe }
  }),
  updateRecipe: recipe => ({
    type: actions.RECIPE_UPDATE,
    payload: { recipe: recipe }
  })
};
export default actions;
