import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
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
          <p>{recipe.servings}</p>
          <hr />
          <h6 className='pb-3'>Ingredients</h6>
          {recipe.ingredients.map((ingredient, index) => {
            const product = products.find(p => p._id === ingredient.product);
            if (product) {
              return (
                <Row key={index}>
                  <Col>
                    <p>{`${product.name}`}</p>
                  </Col>
                  <Col>
                    <p className='float-right pr-5'>{` x ${ingredient.quantity}`}</p>
                  </Col>
                </Row>
              );
            }
          })}
          <hr />
          {recipe.ingredients.map((ingredient, index) => {
            const product = products.find(p => p._id === ingredient.product);
            if (product && product.calcNutrition) {
              return (
                <Fragment>
                  <Row key={index}>
                    <Col>
                      <strong>Measurement:</strong>
                    </Col>
                    <Col>
                      <strong className=' pr-5'>per 100g</strong>
                    </Col>
                    <Col>
                      <strong className=' pr-5'>per serving</strong>
                    </Col>
                  </Row>
                  <Row key={index}>
                    <Col>
                      <p>Energy (kJ):</p>
                    </Col>
                    <Col>
                      <p className=' pr-5'>
                        {product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kJ)').valuePer100 *
                          ingredient.quantity}
                      </p>
                    </Col>
                    <Col>
                      <p className=' pr-5'>
                        {(product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kJ)').valuePer100 /
                          100) *
                          product.qtyContents.quantity *
                          recipe.servings}
                      </p>
                    </Col>
                  </Row>
                  <Row key={index}>
                    <Col>
                      <p>Calories (kcal):</p>
                    </Col>
                    <Col>
                      <p className=' pr-5'>
                        {product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kcal)').valuePer100 *
                          ingredient.quantity}
                      </p>
                    </Col>
                    <Col>
                      <p className=' pr-5'>
                        {(product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kcal)').valuePer100 /
                          100) *
                          product.qtyContents.quantity *
                          recipe.servings}
                      </p>
                    </Col>
                  </Row>
                </Fragment>
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
