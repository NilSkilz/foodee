import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import moment from 'moment';

class RecipeDrawer extends Component {
  onClose = () => {
    this.props.dispatch({
      type: 'SHOW_RECIPE',
      recipe: null
    });
  };

  getRecipeStockCount = recipe => {
    if (recipe.stock.length > 0) {
      return recipe.stock.reduce((acc, stock) => {
        return { quantity: acc.quantity + stock.quantity };
      });
    } else {
      return { quantity: 0 };
    }
  };

  getLastPurchased = recipe => {
    const length = recipe.stock.length - 1;
    const lastStock = recipe.stock[length] || {};
    const date = lastStock.purchase_date;
    if (date) {
      return moment(date).fromNow();
    }
    return 'n/a';
  };

  render() {
    const { showing: recipe, products } = this.props;
    if (recipe && products) {
      return (
        <Drawer
          title={recipe.name}
          placement='right'
          closable={false}
          visible={recipe ? true : false}
          width='50%'
          onClose={this.onClose}>
          <h6 className='pb-3'>Number of Servings</h6>
          <h7>{recipe.servings}</h7>
          <hr></hr>
          <h6 className='pb-3'>Ingredients</h6>
          {recipe.ingredients.map(ingredient => {
            const product = products.find(p => p._id === ingredient.product);
            if (product) {
              return (
                <>
                  <h7>{`${product.name}`}</h7>
                  <h7 className='float-right pr-5'>{` x ${ingredient.quantity}`}</h7>
                  {/* <img width='100%' src={product.image.replace('90x90', '540x540')} alt={product.name} /> */}
                  {/* <div>
                  <span style={{ fontSize: '20px' }}>{`${this.getRecipeStockCount(product).quantity}`}</span>
                  <span> in stock</span>

                  <span style={{ fontSize: '20px' }}>{` / ${product.minimum_stock}`}</span>
                  <span> required</span>
                </div>
                <div>
                  <span className='mr-3'> Current price:</span>
                  <span style={{ fontWeight: '200' }}>{`£${product.price ? product.price.toFixed(2) : ' n/a'}`}</span>
                </div>
                <div>
                  <span className='mr-3'> Last purchased:</span>
                  <span style={{ fontWeight: '200' }}>{this.getLastPurchased(product)}</span>
                </div> */}
                </>
              );
            }
          })}
        </Drawer>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => {
  return {
    showing: state.Recipes.showing,
    products: state.Products.all
  };
};

export default connect(mapStateToProps)(RecipeDrawer);
