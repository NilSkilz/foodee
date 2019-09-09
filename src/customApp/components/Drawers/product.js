import React, { Component } from 'react';
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
