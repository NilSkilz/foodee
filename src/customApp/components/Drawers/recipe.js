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
    const { showing: recipe } = this.props;

    if (recipe) {
      return (
        <Drawer title={recipe.name} placement='right' closable={false} visible={recipe} onClose={this.onClose}>
          <img width='100%' src={recipe.image.replace('90x90', '540x540')} alt={recipe.name} />
          <div>
            <span style={{ fontSize: '20px' }}>{`${this.getRecipeStockCount(recipe).quantity}`}</span>
            <span> in stock</span>

            <span style={{ fontSize: '20px' }}>{` / ${recipe.minimum_stock}`}</span>
            <span> required</span>
          </div>
          <div>
            <span className='mr-3'> Current price:</span>
            <span style={{ fontWeight: '200' }}>{`£${recipe.price ? recipe.price.toFixed(2) : ' n/a'}`}</span>
          </div>
          <div>
            <span className='mr-3'> Last purchased:</span>
            <span style={{ fontWeight: '200' }}>{this.getLastPurchased(recipe)}</span>
          </div>
        </Drawer>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => {
  return {
    showing: state.Recipes.showing
  };
};

export default connect(mapStateToProps)(RecipeDrawer);
