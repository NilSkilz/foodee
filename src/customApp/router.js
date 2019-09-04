import asyncComponent from '../helpers/AsyncFunc';

const routes = [
  {
    path: 'products',
    component: asyncComponent(() => import('./containers/Products/products'))
  }
];
export default routes;
