import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, Menu, Dropdown, Button, Input } from 'antd';
import moment from 'moment';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper.js';
import LayoutContent from '../../../components/utility/layoutContent';
import ProductDetailsDrawer from '../../components/ProductDetailsDrawer/ProductDetailsDrawer';
import ProductModalDrawer from '../../components/ProductModalDrawer/ProductModalDrawer';
import RowStock from '../../components/rowStock';

const menu = (
  <Menu>
    <Menu.Item>
      <Button type='link'>Consume one</Button>
    </Menu.Item>
    <Menu.Item>
      <Button type='link'>Consume all</Button>
    </Menu.Item>
    <Menu.Item>
      <Button type='link'>Mark as spoiled</Button>
    </Menu.Item>
  </Menu>
);

class ProductView extends Component {
  state = {
    pagination: {},
    loading: false,
    searchText: ''
  };

  componentWillReceiveProps(props) {
    console.log(props);
  }

  componentDidUpdate() {
    console.log(this.props);
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type='primary'
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon='search'
          size='small'
          style={{ width: 90, marginRight: 8 }}>
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size='small' style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type='search' style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    console.log(selectedKeys);
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
  };

  showProduct = event => {
    const { id } = event.target;
    const product = this.props.Products.all.find(p => p._id === id);
    if (product)
      this.props.dispatch({
        type: 'SHOW_PRODUCT',
        product
      });
  };

  editProduct = event => {
    const { id } = event.target;
    const product = this.props.Products.all.find(p => p._id === id);
    if (product)
      this.props.dispatch({
        type: 'EDIT_PRODUCT',
        product
      });
  };

  columns = [
    {
      title: '',
      render: product => {
        if (product.stock.length >= product.minimum_stock) return <RowStock status='success' />;
        if (product.stock.length > 0) return <RowStock status='warning' />;
        return <RowStock status='error' />;
      },
      className: 'p-0'
    },
    {
      title: 'Name',
      sorter: true,
      render: product => {
        return (
          <div onClick={this.showProduct} id={product._id}>
            {product.name}
          </div>
        );
      },
      ...this.getColumnSearchProps('name')
    },
    {
      title: 'Stock',
      render: product => product.stock.length
    },
    {
      title: 'Best Before',
      render: product => {
        const purchaseDate = product.stock[0].purchase_date;
        if (product.best_before) {
          const bestBefore = moment(purchaseDate).add(product.best_before.value, product.best_before.unit);
          return bestBefore.fromNow();
        }
        return '-';
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: '16%',
      align: 'center',
      className: 'mr-0 pr-0 pl-0',
      render: product => (
        <span>
          <Dropdown className='ml-3' overlay={menu}>
            <a className='ant-dropdown-link' href='#'>
              <Icon type='more' />
            </a>
          </Dropdown>
          <Button className='ml-3' icon='edit' type='link' onClick={this.editProduct} id={product._id}></Button>
          <Button className='ml-3 mr-0' icon='delete' type='link'></Button>
        </span>
      )
    }
  ];

  render() {
    console.log(this.props);
    return (
      <>
        <LayoutContentWrapper className='h-25 pb-0'>
          <LayoutContent>
            {/* <div>Add Product by Barcode</div> */}
            <Input
              prefix={<Icon type='barcode' style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder='Barcode'
              size='large'
              // value={product.gtin}
              autoFocus
              name='barcode'
              id='barcode'
            />
          </LayoutContent>
        </LayoutContentWrapper>
        <LayoutContentWrapper className='h-100'>
          <LayoutContent>
            <ProductDetailsDrawer />
            <ProductModalDrawer />
            <Table
              columns={this.columns}
              rowKey={record => record.gtin}
              dataSource={this.props.Products.all}
              loading={this.state.loading}
              onChange={this.handleTableChange}
            />
          </LayoutContent>
        </LayoutContentWrapper>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    Products: state.Products
  };
};

export default connect(mapStateToProps)(ProductView);
