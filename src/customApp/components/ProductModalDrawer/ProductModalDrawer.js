import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'reactstrap';
import { Drawer, Form, Icon, Checkbox, Button, Input, InputNumber, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

class ProductModalDrawer extends Component {
  onClose = () => {
    this.props.dispatch({
      type: 'EDIT_PRODUCT',
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
    const { editing: product, departments, superDepartments } = this.props;

    // const { getFieldDecorator } = this.props.form;

    if (product) {
      return (
        <Drawer
          title={product.name}
          placement='right'
          closable={false}
          visible={product}
          onClose={this.onClose}
          width='80%'>
          <Form onSubmit={this.handleSubmit} className='login-form'>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='department'>
                Barcode
              </div>
              <Input
                prefix={<Icon type='barcode' style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder='Barcode'
                size='large'
                value={product.gtin}
                autoFocus
                name='barcode'
                id='barcode'
              />
            </Form.Item>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='name'>
                Name
              </div>
              <Input
                value={product.name || ''}
                type='input'
                name='name'
                id='name'
                onChange={this.handleChange}
                size='large'
              />
            </Form.Item>
            <Row className='pl-3 pr-3'>
              <Form.Item className='p-0 m-0 mb-2 col-6'>
                <div className='p-0 m-0' for='price'>
                  Price
                </div>
                <InputNumber
                  className='form-control'
                  formatter={value => `£${value}`}
                  id='price'
                  name='price'
                  size='large'
                  value={product.price}
                  onChangeEvent={this.handleChange}
                />
              </Form.Item>
              <Form.Item className='p-0 m-0 mb-2 col-6'>
                <div className='p-0 m-0' for='minimum_stock'>
                  Minimum Stock
                </div>
                <InputNumber
                  className='form-control'
                  // formatter={value => `${value}`}
                  id='minimum_stock'
                  name='minimum_stock'
                  size='large'
                  value={product.minimum_stock}
                  defaultValue={2}
                  onChangeEvent={this.handleChange}
                />
              </Form.Item>
            </Row>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='department'>
                Department
              </div>
              <Select defaultValue='Select Department' onChange={this.handleChange} size='large'>
                {departments.map(d => (
                  <Option value={d._id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='superDepartment'>
                Category
              </div>
              <Select defaultValue='Select Category' onChange={this.handleChange} size='large'>
                {superDepartments.map(d => (
                  <Option value={d._id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className='pt-3 m-0'>
              <Button type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => {
  return {
    editing: state.Products.editing,
    departments: state.Departments.all,
    superDepartments: state.SuperDepartments.all
  };
};

export default connect(mapStateToProps)(ProductModalDrawer);
