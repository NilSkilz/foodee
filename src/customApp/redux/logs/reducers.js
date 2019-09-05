const initState = [];

export default function logs(state = initState, action) {
  switch (action.type) {
    case 'LOGS_FETCH_ALL': {
      return { ...state, all: action.logs };
    }

    default:
      return state;
  }
}
