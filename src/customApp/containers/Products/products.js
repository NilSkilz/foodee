import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, Menu, Dropdown, Button, Input, Pagination } from 'antd';
import moment from 'moment';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper.js';
import LayoutContent from '../../../components/utility/layoutContent';
import ProductDrawer from '../../components/Drawers/product';
import ProductModal from '../../components/Modals/product';
import RowStock from '../../components/rowStock';

const { Search } = Input;

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: 'http://at.alicdn.com/t/font_1407868_5h5vuid7mcb.js'
});

class ProductView extends Component {
  state = {
    barcode: '',
    loading: true,
    searchText: '',
    data: null
  };

  componentDidMount() {
    this.setState({ data: this.props.products });
  }

  componentDidUpdate(prevProps) {
    if (this.props.products !== prevProps.products) {
      this.setState({ data: this.props.products });
    }
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
    const searchText = selectedKeys[0];
    this.setState({ searchText: searchText });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  showProduct = event => {
    const { id } = event.target;
    const product = this.props.products.find(p => p._id === id);
    if (product)
      this.props.dispatch({
        type: 'SHOW_PRODUCT',
        product
      });
  };

  editProduct = event => {
    const { id } = event.target;
    const product = this.props.products.find(p => p._id === id);
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
      sorter: (a, b) => a.name - b.name,
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
      sorter: (a, b) => a.stock.length - b.stock.length,
      render: product => product.stock.length
    },
    {
      title: 'Best Before',
      sorter: (a, b) => {
        const aa = a.stock.find(stock => {
          if (!stock.isFrozen) return stock;
        });
        const bb = b.stock.find(stock => {
          if (!stock.isFrozen) return stock;
        });

        if (!aa.best_before_date) return 1;
        if (!bb.best_before_date) return -1;

        const first = moment(aa.best_before_date);
        const last = moment(bb.best_before_date);

        if (first.isSame(last)) return 0;
        if (first.isBefore(last)) return -1;
        return 1;
      },
      render: product => {
        let frozen = false;
        const lastStock = product.stock.find(stock => {
          if (!stock.isFrozen) {
            return stock;
          } else {
            frozen = true;
          }
        });
        if (lastStock) {
          const { purchaseDate } = lastStock;
          if (product.best_before) {
            const bestBefore = moment(purchaseDate).add(product.best_before.value, product.best_before.unit);
            return bestBefore.fromNow();
          }
        }
        if (frozen)
          return (
            <div className='icons-list'>
              <IconFont type='icon-frozen' style={{ fontSize: '22px', color: '#ccc' }} />
            </div>
          );
        return '-';
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: '16%',
      align: 'center',
      className: 'mr-0 pr-0 pl-0',
      render: (text, product, index) => (
        <span>
          <Dropdown className='ml-3' overlay={this.getMenu(index)}>
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

  addProduct = value => {
    this.props.dispatch({ type: 'PRODUCT_CREATE', barcode: value });
  };

  sendToFreezer = product => {
    const stock = product.stock.find(stock => {
      if (!stock.isFrozen) return stock;
    });
    stock.isFrozen = true;
    this.props.dispatch({
      type: 'STOCK_UPDATE',
      stock: stock
    });
  };

  getMenu = index => {
    return (
      <Menu>
        <Menu.Item>
          <Button
            type='link'
            onClick={() => {
              console.log('hi');
            }}>
            Consume one
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Button type='link'>Consume all</Button>
        </Menu.Item>
        <Menu.Item>
          <Button type='link'>Mark as spoiled</Button>
        </Menu.Item>
        <Menu.Item>
          <Button
            type='link'
            name={index}
            id={index}
            onClick={event => {
              const index = event.target.id;
              const product = this.props.products[index];
              this.sendToFreezer(product);
            }}>
            Send to Freezer
          </Button>
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { data, searchText, loading } = this.state;

    if (data && loading) {
      this.setState({ loading: false });
    }

    let filtered = data;
    if (searchText) {
      filtered = data.filter(product => product.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0);
    }
    return (
      <>
        <LayoutContentWrapper className='h-25 pb-0'>
          <LayoutContent>
            <Search
              placeholder='Barcode'
              enterButton='Add'
              size='large'
              onSearch={this.addProduct}
              prefix={<Icon type='barcode' style={{ color: 'rgba(0,0,0,.25)' }} />}
            />

            <div className='mt-3'>Add Product by Barcode</div>
          </LayoutContent>
        </LayoutContentWrapper>
        <LayoutContentWrapper className='h-100'>
          <LayoutContent>
            <ProductDrawer />
            <ProductModal />
            <Table columns={this.columns} rowKey='_id' dataSource={filtered} loading={loading} />
          </LayoutContent>
        </LayoutContentWrapper>
      </>
    );
  }
}

const mapStateToProps = state => ({
  products: state.Products.all
});

export default connect(mapStateToProps)(ProductView);
