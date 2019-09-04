const actions = {
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  addProduct: barcode => ({
    type: actions.PRODUCT_CREATE,
    payload: { barcode: barcode }
  })
  // GIT_SUCCESS_RESULT: 'GIT_SUCCESS_RESULT',
  // GIT_ERROR_RESULT: 'GIT_ERROR_RESULT',
  // gitSearch: searcText => ({
  //   type: actions.GIT_SEARCH,
  //   payload: { searcText, page: 1 }
  // }),
  // onPageChange: (searcText, page) => ({
  //   type: actions.GIT_SEARCH,
  //   payload: { searcText, page }
  // }),
  // gitSearchSuccess: (result, total_count, page) => ({
  //   type: actions.GIT_SUCCESS_RESULT,
  //   result,
  //   total_count,
  //   page
  // }),
  // gitSearchError: () => ({
  //   type: actions.GIT_ERROR_RESULT
  // })
};
export default actions;
