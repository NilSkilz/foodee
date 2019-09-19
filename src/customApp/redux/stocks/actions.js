const actions = {
  STOCK_UPDATE: 'STOCK_UPDATE',
  updateStock: stock => ({
    type: actions.STOCK_UPDATE,
    payload: { stock: stock }
  })
};
export default actions;
