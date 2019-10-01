import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import moment from 'moment';

class ProductDrawer extends Component {
  onClose = () => {
    this.props.dispatch({
      type: 'SHOW_PRODUCT',
      product: null
    });
  };

  getProductStockCount = product => {
    if (product.stock.length > 0) {
      return product.stock.reduce((acc, stock) => {
        return { quantity: acc.quantity + stock.quantity };
      });
    } else {
      return { quantity: 0 };
    }
  };

  getLastPurchased = product => {
    const length = product.stock.length - 1;
    const lastStock = product.stock[length] || {};
    const date = lastStock.purchase_date;
    if (date) {
      return moment(date).fromNow();
    }
    return 'n/a';
  };

  render() {
    const { showing: product } = this.props;

    if (product) {
      return (
        <Drawer title={product.name} placement='right' closable={false} visible={product} onClose={this.onClose}>
          <div>
            <img width='100%' src={product.image.replace('90x90', '540x540')} alt={product.name} />
            <div>
              <span style={{ fontSize: '20px' }}>{`${this.getProductStockCount(product).quantity}`}</span>
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
            </div>
          </div>
          <hr />
          {product.calcNutrition ? (
            <Fragment>
              <div>
                <span className='mr-3'>Energy (kJ):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kJ)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Calories (kcal):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Energy (kcal)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Fat (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Fat (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Saturates (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Saturates (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Carbohydrate (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Carbohydrate (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Sugars (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Sugars (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Fibre (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Fibre (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Protein (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Protein (g)').valuePer100}
                </span>
              </div>

              <div>
                <span className='mr-3'>Salt (g):</span>
                <span style={{ fontWeight: '200', float: 'right' }}>
                  {product.calcNutrition.calcNutrients.find(item => item.name === 'Salt (g)').valuePer100}
                </span>
              </div>
            </Fragment>
          ) : null}
        </Drawer>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => {
  return {
    showing: state.Products.showing
  };
};

export default connect(mapStateToProps)(ProductDrawer);
