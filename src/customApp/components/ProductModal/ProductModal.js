import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'reactstrap';
import { Modal, Form, Icon, Button, Input, InputNumber, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

class ProductModal extends Component {
  state = { prodcut: null };
  componentWillReceiveProps(props) {
    const { editing: product } = props;
    if (product) this.setState({ product });
  }

  onClose = () => {
    this.setState({ product: null });
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

  handleStockChange = value => {
    const { product } = this.state;
    product.minimum_stock = value;
    this.setState({ product });
  };

  handlePriceChange = value => {
    const { product } = this.state;
    product.price = value;
    this.setState({ product });
  };

  handleChange = event => {
    const { product } = this.state;
    product[event.target.id] = event.target.value;
    this.setState({ product });
  };

  selectDepartment = value => {
    const { product } = this.state;
    product.department = value;
    this.setState({ product });
  };

  selectSuperDepartment = value => {
    const { product } = this.state;
    product.superDepartment = value;
    this.setState({ product });
  };

  render() {
    const { departments, superDepartments } = this.props;
    const { product } = this.state;

    if (product) {
      return (
        <Modal
          title={product.name}
          closable={false}
          visible={product}
          onClose={this.onClose}
          footer={[
            <Button key='Cancel' onClick={this.onClose}>
              Cancel
            </Button>,
            <Button key='Save' type='primary' loading={false} onClick={this.save}>
              Save
            </Button>
          ]}
          // width='80%'
        >
          <Form onSubmit={this.handleSubmit} className=''>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='department'>
                Barcode
              </div>
              <Input
                prefix={<Icon type='barcode' style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder='Barcode'
                size='large'
                value={product.gtin}
                onChange={this.handleChange}
                autoFocus
                name='gtin'
                id='gtin'
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
                  step={0.01}
                  value={product.price}
                  onChange={this.handlePriceChange}
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
                  onChange={this.handleStockChange}
                />
              </Form.Item>
            </Row>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='department'>
                Department
              </div>
              <Select
                defaultValue='Select Department'
                onChange={this.selectDepartment}
                size='large'
                value={product.department && departments.find(d => d._id === product.department).name}>
                {departments.map(d => (
                  <Option value={d._id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className='p-0 m-0 mb-2'>
              <div className='p-0 m-0' for='superDepartment'>
                Category
              </div>
              <Select
                defaultValue='Select Category'
                onChange={this.selectSuperDepartment}
                size='large'
                value={product.superDepartment && superDepartments.find(sd => sd._id === product.superDepartment).name}>
                {superDepartments.map(d => (
                  <Option value={d._id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
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

export default connect(mapStateToProps)(ProductModal);
