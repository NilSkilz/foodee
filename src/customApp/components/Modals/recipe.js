import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Row, Col } from "reactstrap";
import { Modal, Form, Icon, Button, Input, InputNumber, Select } from "antd";
import moment from "moment";

const { Option } = Select;

class RecipeModal extends Component {
  state = { recipe: null };
  componentWillReceiveProps(props) {
    const { editing: recipe } = props;
    if (recipe) this.setState({ recipe });
  }

  onClose = () => {
    this.setState({ recipe: null });
    this.props.dispatch({
      type: "EDIT_RECIPE",
      recipe: null
    });
  };

  handleServingsChange = value => {
    const { recipe } = this.state;
    recipe.servings = value;
    this.setState({ recipe });
  };

  handleQuantityChange = event => {
    const { recipe } = this.state;
    recipe.ingredients[event.target.id].quantity = event.target.value;
    this.setState({ recipe });
  };

  handleChange = event => {
    const { recipe } = this.state;
    recipe[event.target.id] = event.target.value;
    this.setState({ recipe });
  };

  selectProduct = (value, obj) => {
    const { recipe } = this.state;
    recipe.ingredients[obj.props.id].product = value;
    this.setState({ recipe });
  };

  addIngredient = () => {
    const { recipe } = this.state;
    recipe.ingredients.push({});
    this.setState({ recipe });
  };

  deleteIngredient = () => {};

  save = () => {
    const { recipe } = this.state;
    this.props.dispatch({
      type: "RECIPE_CREATE",
      recipe
    });
  };

  render() {
    const { products } = this.props;
    const { recipe } = this.state;

    if (recipe) {
      if (!recipe.ingredients) recipe.ingredients = [{}];
      return (
        <Modal
          title={recipe.name}
          closable={false}
          visible={recipe}
          onClose={this.onClose}
          footer={[
            <Button key="Cancel" onClick={this.onClose}>
              Cancel
            </Button>,
            <Button
              key="Save"
              type="primary"
              loading={false}
              onClick={this.save}
            >
              Save
            </Button>
          ]}
          // width='80%'
        >
          <Form onSubmit={this.handleSubmit} className="">
            <Form.Item className="p-0 m-0 mb-2">
              <div className="p-0 m-0" for="name">
                Name
              </div>
              <Input
                value={recipe.name || ""}
                type="input"
                name="name"
                id="name"
                onChange={this.handleChange}
                size="large"
              />
            </Form.Item>

            <Row className="pl-3 pr-3">
              <Form.Item className="p-0 m-0 mb-2 col-6">
                <div className="p-0 m-0" for="servings">
                  Number of Servings
                </div>
                <InputNumber
                  className="form-control"
                  id="servings"
                  name="servings"
                  size="large"
                  value={recipe.servings}
                  defaultValue={2}
                  onChange={this.handleServingsChange}
                />
              </Form.Item>
            </Row>
            {recipe.ingredients.map((i, index) => {
              return (
                <Fragment>
                  <Row key={index}>
                    <Col xs="6">
                      <Form.Item className="p-0 m-0 mb-2">
                        <div className="p-0 m-0" for="product">
                          {index === 0 ? "Product" : null}
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs="4">
                      <Form.Item className="p-0 m-0 mb-2 col-6">
                        <div className="p-0 m-0" for="Number">
                          {index === 0 ? "Quantity" : null}
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs="2"></Col>
                  </Row>
                  <Row>
                    <Col xs="6">
                      <Form.Item className="p-0 m-0 mb-2">
                        <Select
                          defaultValue="Select Product"
                          onChange={this.selectProduct}
                          size="large"
                          id="1"
                          name="1"
                          value={
                            i.product &&
                            products &&
                            products.find(p => p._id === i.product).name
                          }
                        >
                          {products.map(p => (
                            <Option value={p._id} id={index}>
                              {p.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs="4">
                      <Form.Item className="p-0 m-0 mb-2 col-6">
                        <Input
                          type="number"
                          className="form-control"
                          id={index}
                          name={index}
                          size="large"
                          value={i.quantity}
                          defaultValue={1}
                          onChange={this.handleQuantityChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs="2">
                      <Form.Item className="p-0 m-0 mb-2 col-6">
                        {recipe.ingredients.length === index + 1 ? (
                          <Icon
                            type="plus"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle"
                            }}
                            onClick={this.addIngredient}
                          />
                        ) : (
                          <Icon
                            type="delete"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle"
                            }}
                            onClick={this.deleteIngredient}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Fragment>
              );
            })}
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
    editing: state.Recipes.editing,
    products: state.Products.all
  };
};

export default connect(mapStateToProps)(RecipeModal);
