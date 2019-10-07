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
    this.getMetrics();
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

  getMetrics = () => {
    Axios.get('/api/metrics').then(({ data }) => {
      this.props.dispatch({
        type: 'METRICS_FETCH_ALL',
        metrics: data.data
      });
      this.setState({ metrics: data.data });
    });
  };

  render() {
    return null;
  }
}

export default connect()(DataLoader);
