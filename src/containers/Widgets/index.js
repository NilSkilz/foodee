import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import clone from 'clone';
import { Row, Col, Table } from 'antd';
import moment from 'moment';
import LayoutWrapper from '../../components/utility/layoutWrapper.js';
import basicStyle from '../../settings/basicStyle';
import IsoWidgetsWrapper from './widgets-wrapper';
import IsoWidgetBox from './widget-box';
import ProductDrawer from '../../customApp/components/Drawers/product';
import RecipeDrawer from '../../customApp/components/Drawers/recipe';
import { Doughnut } from 'react-chartjs-2';
import Box from '../../components/utility/box';
import ContentHolder from '../../components/utility/contentHolder';
import FrappeChart from 'frappe-charts/dist/frappe-charts.min.esm';

import CardWidget from './card/card-widgets';
import ProgressWidget from './progress/progress-widget';
import SingleProgressWidget from './progress/progress-single';
import ReportsWidget from './report/report-widget';
import StickerWidget from './sticker/sticker-widget';
import SaleWidget from './sale/sale-widget';
import VCardWidget from './vCard/vCard-widget';
import SocialWidget from './social-widget/social-widget';
import SocialProfile from './social-widget/social-profile-icon';
import userpic from '../../image/user1.png';
import { TableViews, tableinfos, dataList } from '../Tables/antTables';
import * as rechartConfigs from '../Charts/recharts/config';
import { StackedAreaChart } from '../Charts/recharts/charts/';
import { GoogleChart } from '../Charts/googleChart/';
import * as googleChartConfigs from '../Charts/googleChart/config';
import IntlMessages from '../../components/utility/intlMessages';

const tableDataList = clone(dataList);
tableDataList.size = 5;

class Dashboard extends Component {
  state = { loading: true };

  getID = () => {
    const { metrics } = this.props;
    if (!metrics) return;
    setTimeout(this.createChart, 1000);
    return 'chart';
  };

  createChart = () => {
    new FrappeChart({
      header: 'Line Chart',
      title: '',
      parent: '#chart',
      parentId: 'chart',
      type: 'line',
      data: this.getGraphData(),
      show_dots: 0,
      heatline: 1,
      region_fill: 1,
      height: 250
      // format_tooltip_x: d => (d + '').toUpperCase(),
      // format_tooltip_y: d => d + ' pts'
    });
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

  showRecipe = event => {
    const { id } = event.target;
    const recipe = this.props.recipes.find(r => r._id === id);
    if (recipe)
      this.props.dispatch({
        type: 'SHOW_RECIPE',
        recipe
      });
  };

  getProductsOrderedByBestBeforeDate = () => {
    const { products } = this.props;

    if (!products) return [];

    const productsWithBestBefore = products.filter(
      product => product.stock.find(stock => stock.best_before_date !== undefined && !stock.isFrozen) !== undefined
    );

    const sorted = productsWithBestBefore.sort((a, b) => {
      const aa = a.stock.find(stock => stock.best_before_date !== undefined);
      const bb = b.stock.find(stock => stock.best_before_date !== undefined);

      const first = moment(aa.best_before_date);
      const last = moment(bb.best_before_date);

      if (first.isSame(last)) return 0;
      if (first.isBefore(last)) return -1;
      return 1;
    });
    return productsWithBestBefore;
  };

  isProductInStock = ({ stock = [] }) => {
    return stock.length > 0;
  };

  getRecipiesWithStock = () => {
    const { products, recipes } = this.props;

    if (!products || !recipes) return [];

    const arr = recipes.filter(recipe => {
      let inStock = true;
      recipe.ingredients.forEach(ingredient => {
        if (!this.isProductInStock(products.find(product => product._id === ingredient.product))) {
          inStock = false;
        }
      });
      if (inStock) return recipe;
    });
    return arr;
  };

  getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  getMetric = type => {
    const { metrics } = this.props;
    if (!metrics) return 0;
    return metrics.find(metric => metric.type === type).value;
  };

  getLocationBarChart = () => {
    const { products } = this.props;
    let totalCount = 0;
    let freezerCount = 0;

    products.forEach(product => {
      product.stock.forEach(stock => {
        if (stock.isFrozen) {
          freezerCount++;
        }
        totalCount++;
      });
    });

    return {
      labels: ['Freezer', 'Cupboard'],
      datasets: [
        {
          data: [freezerCount, totalCount - freezerCount],
          backgroundColor: ['#7266BA', '#48A6F2'],
          hoverBackgroundColor: ['#7266BA', '#48A6F2']
        }
      ]
    };
  };

  getProductBarChart = () => {
    const { metrics } = this.props;
    if (!metrics) return {};
    return {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [
        {
          data: [
            this.getMetric('product_in_stock_count'),
            this.getMetric('product_low_stock_count'),
            this.getMetric('product_out_of_stock_count')
          ],
          backgroundColor: ['#7266BA', '#48A6F2', '#F75D81'],
          hoverBackgroundColor: ['#7266BA', '#48A6F2', '#F75D81']
        }
      ]
    };
  };

  getGraphData = () => {
    const { metrics } = this.props;
    const obj = {};

    obj.labels = [];
    obj.datasets = [];

    const productMetrics = metrics.filter(metric => metric.type === 'product_count');
    const inStockMetrics = metrics.filter(metric => metric.type === 'product_in_stock_count');
    const outOfStockMetrics = metrics.filter(metric => metric.type === 'product_out_of_stock_count');

    const products = {
      name: 'Products',
      chartType: 'line',
      values: []
    };

    const inStock = { name: 'In Stock', chartType: 'line', values: [] };

    const outStock = { name: 'Out of Stock', chartType: 'line', values: [] };

    for (var i = 0; i < 30; i++) {
      const day = moment()
        .subtract(i, 'days')
        .startOf('day');

      const data = {};
      const productMetric = productMetrics.find(metric =>
        moment(metric.created_at)
          .startOf('day')
          .isSame(day)
      );
      const inStockMetric = inStockMetrics.find(metric =>
        moment(metric.created_at)
          .startOf('day')
          .isSame(day)
      );
      const outOfStockMetric = outOfStockMetrics.find(metric =>
        moment(metric.created_at)
          .startOf('day')
          .isSame(day)
      );

      obj.labels.push(day.format('Do MMM'));

      console.log('inStockMetric', inStockMetric);

      products.values.push(productMetric ? productMetric.value : 0);
      inStock.values.push(inStockMetric ? inStockMetric.value : 0);
      outStock.values.push(outOfStockMetric ? outOfStockMetric.value : 0);
    }

    products.values = products.values.reverse();
    inStock.values = inStock.values.reverse();
    outStock.values = outStock.values.reverse();

    obj.datasets.push(products);
    obj.datasets.push(inStock);
    obj.datasets.push(outStock);

    obj.labels = obj.labels.reverse();

    console.log('OBJ:', obj);

    return obj;
  };

  getWidth = () => {
    let returnValue = 500;

    if (window.innerWidth < 1200) returnValue = 400;
    if (window.innerWidth < 992) returnValue = 500;
    if (window.innerWidth < 768) returnValue = 500;
    if (window.innerWidth < 576) returnValue = 400;
    if (window.innerWidth < 480) returnValue = 300;

    console.log(window.innerWidth);
    return returnValue;
  };

  getHeight = () => {
    let returnValue = 270;

    if (window.innerWidth < 1200) returnValue = 400;
    if (window.innerWidth < 992) returnValue = 500;
    if (window.innerWidth < 768) returnValue = 500;
    if (window.innerWidth < 576) returnValue = 400;
    if (window.innerWidth < 480) returnValue = 300;

    console.log(window.innerWidth);
    return returnValue;
  };

  render() {
    this.getProductsOrderedByBestBeforeDate();
    const { loading } = this.state;
    const { rowStyle, colStyle } = basicStyle;
    const wisgetPageStyle = {
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'flex-start',
      overflow: 'hidden'
    };

    const { products, recipes } = this.props;

    if (products && recipes && loading) {
      this.setState({ loading: false });
    }

    const chartEvents = [
      {
        eventName: 'select',
        callback(Chart) {}
      }
    ];

    const columns = [
      {
        title: 'Name',
        render: product => {
          return (
            <div style={{ cursor: 'pointer' }} onClick={this.showProduct} id={product._id}>
              {product.name}
            </div>
          );
        }
      },
      {
        title: 'Best Before',
        width: '30%',
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
          return '-';
        }
      }
    ];

    const config = {
      componentName: 'StackedAreaChart',
      key: 'StackedAreaChart',
      title: 'Stacked Area Chart',
      width: 350,
      height: 350,
      colors: ['#BAA6CA', '#B7DCFA', '#FFE69A', '#788195'],
      datas: this.getGraphData()
    };

    const stackConfig = {
      ...config,
      width: this.getWidth(),
      height: this.getHeight()
    };

    return (
      <LayoutWrapper>
        <ProductDrawer />
        <RecipeDrawer />
        <div style={wisgetPageStyle}>
          <Row style={rowStyle} gutter={0} justify='start'>
            <Col lg={6} md={12} sm={12} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                {/* Sticker Widget */}
                <StickerWidget
                  number={this.getMetric('product_count')}
                  text={'Products'}
                  icon='ion-checkmark'
                  fontColor='#ffffff'
                  bgColor='#7266BA'
                />
              </IsoWidgetsWrapper>
            </Col>

            <Col lg={6} md={12} sm={12} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                {/* Sticker Widget */}
                <StickerWidget
                  number={this.getMetric('product_low_stock_count')}
                  text={'Low Stock'}
                  icon='ion-android-cart  '
                  fontColor='#ffffff'
                  bgColor='#42A5F6'
                />
              </IsoWidgetsWrapper>
            </Col>

            <Col lg={6} md={12} sm={12} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                {/* Sticker Widget */}
                <StickerWidget
                  number={'£0'}
                  text={'Total Value'}
                  icon='ion-cash'
                  fontColor='#ffffff'
                  bgColor='#7ED320'
                />
              </IsoWidgetsWrapper>
            </Col>

            <Col lg={6} md={12} sm={12} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                {/* Sticker Widget */}
                <StickerWidget
                  number={this.getMetric('product_out_of_stock_count')}
                  text={'Out of Stock'}
                  icon='ion-close'
                  fontColor='#ffffff'
                  bgColor='#F75D81'
                />
              </IsoWidgetsWrapper>
            </Col>
          </Row>
          <Row style={rowStyle} gutter={0} justify='start'>
            <Col lg={8} md={12} sm={24} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                {/* Report Widget */}
                <ReportsWidget
                  label={'Recipes in Stock'}
                  details={'You have the ingredients available to make these recipes'}>
                  {recipes && (
                    <Table
                      showHeader={false}
                      size='medium'
                      pagination={false}
                      columns={[
                        {
                          title: 'Name',
                          render: recipe => {
                            return (
                              <div style={{ cursor: 'pointer' }} onClick={this.showRecipe} id={recipe._id}>
                                {recipe.name}
                              </div>
                            );
                          }
                        },
                        {
                          title: '',
                          render: recipe => {
                            return <div>serves {recipe.servings}</div>;
                          }
                        }
                      ]}
                      rowKey={record => record._id}
                      dataSource={this.getRecipiesWithStock()}
                      loading={loading}
                      scroll={{ y: 330 }}
                    />
                  )}
                </ReportsWidget>
              </IsoWidgetsWrapper>
            </Col>

            <Col lg={16} md={12} sm={24} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                <IsoWidgetBox>
                  <h5 className='pb-3'>Expiring Soon</h5>
                  {/* TABLE */}
                  {products && (
                    <Table
                      showHeader={false}
                      size='medium'
                      pagination={false}
                      columns={columns}
                      rowKey={record => record._id}
                      dataSource={this.getProductsOrderedByBestBeforeDate()}
                      loading={loading}
                      scroll={{ y: 330 }}
                    />
                  )}
                </IsoWidgetBox>
              </IsoWidgetsWrapper>
            </Col>
          </Row>

          <Row style={rowStyle} gutter={0} justify='start'>
            <Col xl={12} lg={12} md={24} sm={24} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                <ReportsWidget label={'Products'} details={'Hover over any segment for further details'}>
                  <Doughnut data={this.getProductBarChart} />;
                </ReportsWidget>
              </IsoWidgetsWrapper>
            </Col>
            <Col xl={12} lg={12} md={24} sm={24} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                <ReportsWidget label={'Location'} details={'Hover over any segment for further details'}>
                  <Doughnut data={this.getLocationBarChart} />;
                </ReportsWidget>
              </IsoWidgetsWrapper>
            </Col>
          </Row>
          <Row style={rowStyle} gutter={0} justify='start'>
            <Col xl={24} lg={24} md={24} sm={24} xs={24} style={colStyle}>
              <IsoWidgetsWrapper>
                <ReportsWidget label={'Products'}>
                  <div id={this.getID()} />
                </ReportsWidget>
              </IsoWidgetsWrapper>
            </Col>
          </Row>
        </div>
      </LayoutWrapper>
    );
  }
}

const mapStateToProps = state => ({
  products: state.Products.all,
  recipes: state.Recipes.all,
  metrics: state.Metrics.all
});

export default connect(mapStateToProps)(Dashboard);
