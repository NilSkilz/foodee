const initState = [];

export default function(state = initState, action) {
  switch (action.type) {
    case 'ADD_SUPER_DEPTS': {
      return { ...state, all: action.superDepts };
    }

    default:
      return state;
  }
}
