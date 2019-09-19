const actions = {
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  addProduct: barcode => ({
    type: actions.PRODUCT_CREATE,
    payload: { barcode: barcode }
  }),
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  updateProduct: product => ({
    type: actions.PRODUCT_UPDATE,
    payload: { product: product }
  })
};
export default actions;
