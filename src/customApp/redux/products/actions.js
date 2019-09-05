const actions = {
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  addProduct: barcode => ({
    type: actions.PRODUCT_CREATE,
    payload: { barcode: barcode }
  })
};
export default actions;
