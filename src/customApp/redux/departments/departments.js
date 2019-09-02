import _ from 'lodash';

const initState = [];

export default function(state = initState, action) {
  switch (action.type) {
    case 'ADD_DEPTS': {
      return { ...state, all: action.depts };
    }

    default:
      return state;
  }
}
