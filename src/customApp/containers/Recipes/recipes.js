import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, Button, Input } from 'antd';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper.js';
import LayoutContent from '../../../components/utility/layoutContent';
import RecipeModal from '../../components/Modals/recipe';
import RecipeDrawer from '../../components/Drawers/recipe';
import RowStock from '../../components/rowStock';

const { Search } = Input;

class RecipeView extends Component {
  state = {
    loading: false,
    searchText: ''
  };

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

  isProductInStock = ({ stock = [] }) => {
    console.log('instock', stock.length > 0);
    return stock.length > 0;
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

  createRecipe = () => {
    this.props.dispatch({
      type: 'EDIT_RECIPE',
      recipe: {}
    });
  };

  columns = [
    {
      title: '',
      render: recipe => {
        let inStock = true;
        recipe.ingredients.forEach(ingredient => {
          console.log('PROD:', ingredient.product);
          if (!this.isProductInStock(this.props.products.find(product => product._id === ingredient.product))) {
            inStock = false;
          }
        });
        if (inStock) return <RowStock status='success' />;
        return <RowStock status='error' />;
      },
      className: 'p-0'
    },
    {
      title: 'Name',
      // dataIndex: "name",
      render: recipe => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={this.showRecipe} id={recipe._id}>
            {recipe.name}
          </div>
        );
      }
    },
    {
      title: 'Price',
      render: recipe => {
        const { products } = this.props;
        if (products) {
          let approx = false;
          let price = 0;

          recipe.ingredients.forEach(ingredient => {
            const product = products.find(p => p._id === ingredient.product);
            if (product) {
              if (product.price) {
                price += product.price * ingredient.quantity;
              } else {
                approx = true;
              }
            } else {
              approx = true;
            }
          });
          return `${approx ? '~' : ''} £${price.toFixed(2)}`;
        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: '16%',
      align: 'center',
      className: 'mr-0 pr-0 pl-0',
      render: recipe => (
        <span>
          <Button className='ml-3' icon='edit' type='link' onClick={this.editRecipe} id={recipe._id}></Button>
          <Button className='ml-3 mr-0' icon='delete' type='link'></Button>
        </span>
      )
    }
  ];

  render() {
    const { recipes } = this.props;
    if (!recipes) return null;
    return (
      <>
        <LayoutContentWrapper className='h-100'>
          <Button className='m-3 float-right' type='primary' onClick={this.createRecipe}>
            New Recipe
          </Button>
          <LayoutContent>
            <RecipeDrawer />
            <RecipeModal />

            <Table
              columns={this.columns}
              // rowKey={record => record._id}
              // onRow={record => ({ rowKey: record._id })}
              dataSource={this.props.recipes.map(recipe => {
                return { ...recipe, key: recipe._id };
              })}
              loading={this.state.loading}
            />
          </LayoutContent>
        </LayoutContentWrapper>
      </>
    );
  }
}

const mapStateToProps = state => ({
  recipes: state.Recipes.all,
  products: state.Products.all
});

export default connect(mapStateToProps)(RecipeView);
