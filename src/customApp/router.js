import asyncComponent from '../helpers/AsyncFunc';

const routes = [
  {
    path: 'products',
    component: asyncComponent(() => import('./containers/Products/products'))
  },
  {
    path: 'recipes',
    component: asyncComponent(() => import('./containers/Recipes/recipes'))
  },
  {
    path: 'shoppinglist',
    component: asyncComponent(() => import('./containers/ShoppingList/shoppingList'))
  }
];
export default routes;
