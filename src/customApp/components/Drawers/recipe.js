import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import { Drawer } from "antd";
import moment from "moment";

class RecipeDrawer extends Component {
  onClose = () => {
    this.props.dispatch({
      type: "SHOW_RECIPE",
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
    return "n/a";
  };

  getNutrientPer100g = (product, nutrient) => {
    return parseInt(
      product.calcNutrition.calcNutrients.find(item => item.name === nutrient)
        .valuePer100
    );
  };

  getNutrientPerServing = (product, nutrient) => {
    const { showing: recipe } = this.props;
    return parseInt(
      ((product.calcNutrition.calcNutrients.find(item => item.name === nutrient)
        .valuePer100 /
        100) *
        product.pkgDimensions[0].weight) /
        recipe.servings
    );
  };

  getTotalNutrientPer100g = nutrient => {
    const { showing: recipe, products } = this.props;
    let count = 0;
    recipe.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.product);
      if (product && product.calcNutrition) {
        count += parseInt(this.getNutrientPer100g(product, nutrient));
      }
    });
    return count;
  };

  getTotalNutrientPerServing = nutrient => {
    const { showing: recipe, products } = this.props;
    let count = 0;
    recipe.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.product);
      if (product && product.calcNutrition) {
        count += parseInt(this.getNutrientPerServing(product, nutrient));
      }
    });
    return count;
  };

  render() {
    const { showing: recipe, products } = this.props;
    if (recipe && products) {
      return (
        <Drawer
          title={recipe.name}
          placement="right"
          closable={false}
          visible={recipe ? true : false}
          width="50%"
          onClose={this.onClose}
        >
          <h6 className="pb-3">Number of Servings</h6>
          <p>{recipe.servings}</p>
          <hr />
          <h6 className="pb-3">Ingredients</h6>
          {recipe.ingredients.map((ingredient, index) => {
            const product = products.find(p => p._id === ingredient.product);
            if (product) {
              return (
                <Row key={index}>
                  <Col>
                    <p>{`${product.name}`}</p>
                  </Col>
                  <Col>
                    <p className="float-right pr-5">{` x ${ingredient.quantity}`}</p>
                  </Col>
                </Row>
              );
            }
          })}
          <hr />
          <Row>
            <Col>
              <strong>Nutrient</strong>
            </Col>
            <Col>
              <strong className=" pr-5">per 100g</strong>
            </Col>
            <Col>
              <strong className=" pr-5">per serving</strong>
            </Col>
          </Row>
          {[
            "Energy (kJ)",
            "Energy (kcal)",
            "Fat (g)",
            "Saturates (g)",
            "Carbohydrate (g)",
            "Sugars (g)",
            "Fibre (g)",
            "Protein (g)",
            "Salt (g)"
          ].map(nutrient => {
            return (
              <Row>
                <Col>
                  <p>{nutrient}</p>
                </Col>
                <Col>
                  <p className="pr-5">
                    {this.getTotalNutrientPer100g(nutrient)}
                  </p>
                </Col>
                <Col>
                  <p className="pr-5">
                    {this.getTotalNutrientPerServing(nutrient)}
                  </p>
                </Col>
              </Row>
            );
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
