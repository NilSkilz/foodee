const actions = {
  RECIPE_CREATE: 'RECIPE_CREATE',
  addRecipe: recipe => ({
    type: actions.RECIPE_CREATE,
    payload: { recipe: recipe }
  })
};
export default actions;
