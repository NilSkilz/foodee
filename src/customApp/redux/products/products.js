import _ from 'lodash';

const initState = [];

export default function(state = initState, action) {
  switch (action.type) {
    // ----------------------
    // Products

    case 'ADD_PRODUCTS': {
      return { ...state, all: action.products };
    }

    case 'EDIT_PRODUCT': {
      return { ...state, editing: action.product };
    }

    case 'SHOW_PRODUCT': {
      return { ...state, showing: action.product };
    }

    case 'UPDATE_PRODUCT': {
      const { product } = action;
      const products = _.cloneDeep(state.products);
      const oldProduct = products.find(p => p._id === product._id);
      if (oldProduct) {
        products.splice(products.indexOf(oldProduct), 1, product);
      } else {
        // New product
        products.push(product);
      }
      return { ...state, all: products };
    }

    case 'DELETE_PRODUCT': {
      return { ...state, deleting: action.product };
    }

    case 'DELETE_PRODUCT_CONFIRM': {
      const { product } = action;
      const products = _.cloneDeep(state.products);
      const oldProduct = products.find(p => p._id === product._id);
      if (oldProduct) {
        products.splice(products.indexOf(oldProduct), 1);
      }
      return { ...state, all: products };
    }

    default:
      return state;
  }
}
