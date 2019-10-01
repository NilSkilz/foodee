import { Component } from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';

class DataLoader extends Component {
  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.getProducts();
    this.getRecipes();
    this.getLogs();
    this.getDepartments();
    this.getSuperDepartments();
  };

  getProducts = () => {
    Axios.get('/api/products').then(({ data }) => {
      console.log('DAta:', data);
      this.props.dispatch({
        type: 'PRODUCT_FETCH_ALL',
        products: data.results
      });
    });
  };

  getRecipes = () => {
    Axios.get('/api/recipes').then(({ data }) => {
      this.props.dispatch({
        type: 'RECIPE_FETCH_ALL',
        recipes: data.results
      });
    });
  };

  getLogs = () => {
    Axios.get('/api/logs').then(({ data }) => {
      this.props.dispatch({
        type: 'LOGS_FETCH_ALL',
        logs: data.data
      });
      this.setState({ logs: data.data });
    });
  };

  getDepartments = () => {
    Axios.get('/api/departments').then(({ data }) => {
      this.props.dispatch({
        type: 'ADD_DEPTS',
        depts: data.data
      });
      this.setState({ depts: data.data });
    });
  };

  getSuperDepartments = () => {
    Axios.get('/api/superdepartments').then(({ data }) => {
      this.props.dispatch({
        type: 'ADD_SUPER_DEPTS',
        superDepts: data.data
      });
      this.setState({ superDepts: data.data });
    });
  };

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  products: state.products,
  recipes: state.recipes,
  logs: state.logs
});

export default connect(mapStateToProps)(DataLoader);
