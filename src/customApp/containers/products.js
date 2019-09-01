import React, { Component } from 'react';
import { Table, Icon, Menu, Dropdown, Button, Input } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import LayoutContent from '../../components/utility/layoutContent';
import Badge from '../../containers/Uielements/Badge/badge.style';
import RowStock from '../components/rowStock';

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

export default class ProductView extends Component {
  state = {
    data: [],
    pagination: {},
    loading: false,
    searchText: ''
  };

  componentDidMount() {
    this.fetch();
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

    this.fetch({
      results: 10,
      page: 1,
      searchQuery: selectedKeys[0]
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });

    this.fetch({
      results: 10,
      page: 1,
      searchQuery: null
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetch = (
    params = {
      results: 10,
      page: 1,
      sortField: null,
      searchQuery: null
    }
  ) => {
    console.log('params:', params);
    this.setState({ loading: true });

    let url = `/api/products?limit=${params.results}&skip=${(params.page - 1) * 10}`;
    if (params.sortField) url = `${url}&sort[${params.sortField}]=${params.sortOrder === 'ascend' ? '1' : '-1'}`;

    if (params.searchQuery) url = `${url}&where[name][$regex]=${params.searchQuery}&where[name][$options]=i`;

    Axios.get(url)
      .then(({ data }) => {
        console.log('data:', data);
        const pagination = { ...this.state.pagination };
        // Read total count from server
        pagination.total = data.total;
        this.setState({
          loading: false,
          data: data.results,
          pagination
        });
      })
      .catch(err => console.log(err));
  };

  columns = [
    {
      title: '',
      render: product => {
        if (product.stock.length >= product.minimum_stock) return <RowStock status='success' />;
        if (product.stock.length > 0) return <RowStock status='warning' />;
        return <RowStock status='error' />;
      },
      className: 'p-0',
      width: '1%'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      // render: name => `${name.first} ${name.last}`,
      // width: '35%',
      ...this.getColumnSearchProps('name')
    },
    {
      title: 'Stock',
      render: product => product.stock.length,
      width: '1%'
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
      },
      width: '14%'
    },
    {
      title: 'Action',
      key: 'action',
      width: '16%',
      align: 'center',
      className: 'mr-0 pr-0 pl-0',
      render: (text, record) => (
        <span>
          {/* <a>Action 一 {record.name}</a>
          <Divider type='vertical' />
          <a>Delete</a>
          <Divider type='vertical' /> */}
          <Dropdown className='ml-3' overlay={menu}>
            <a className='ant-dropdown-link' href='#'>
              <Icon type='more' />
            </a>
          </Dropdown>
          <Button className='ml-3' icon='edit' type='link'></Button>
          <Button className='ml-3 mr-0' icon='delete' type='link'></Button>
        </span>
      )
    }
  ];

  render() {
    return (
      <LayoutContentWrapper className='h-100'>
        <LayoutContent>
          <Table
            // className='p-3'
            columns={this.columns}
            rowKey={record => record.gtin}
            dataSource={this.state.data}
            pagination={this.state.pagination}
            loading={this.state.loading}
            onChange={this.handleTableChange}
          />
        </LayoutContent>
      </LayoutContentWrapper>
    );
  }
}
