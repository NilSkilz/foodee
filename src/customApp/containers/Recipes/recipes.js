import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, Button, Input } from 'antd';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper.js';
import LayoutContent from '../../../components/utility/layoutContent';
import ProductDetailsDrawer from '../../components/ProductDetailsDrawer/ProductDetailsDrawer';
import ProductModal from '../../components/ProductModal/ProductModal';

const { Search } = Input;

class RecipeView extends Component {
  state = {
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

  showRecipe = event => {
    const { id } = event.target;
    const recipe = this.props.recipes.find(r => r._id === id);
    if (recipe)
      this.props.dispatch({
        type: 'SHOW_RECIPE',
        recipe
      });
  };

  editRecipe = event => {
    const { id } = event.target;
    const recipe = this.props.recipes.find(r => r._id === id);
    if (recipe)
      this.props.dispatch({
        type: 'EDIT_RECIPE',
        recipe
      });
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    }
  ];

  render() {
    console.log('Recipes', this.props.recipes);
    return (
      <>
        <LayoutContentWrapper className='h-100'>
          <LayoutContent>
            <ProductDetailsDrawer />
            <ProductModal />
            <Button className='m-3 float-right' type='primary'>
              New Recipe
            </Button>
            <Table
              columns={this.columns}
              rowKey={record => record._id}
              dataSource={this.props.recipes}
              loading={this.state.loading}
            />
          </LayoutContent>
        </LayoutContentWrapper>
      </>
    );
  }
}

const mapStateToProps = state => ({
  recipes: state.Recipes.all
});

export default connect(mapStateToProps)(RecipeView);
