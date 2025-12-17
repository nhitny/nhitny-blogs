const initialState = {
  user: undefined,
};

interface UserAction {
  type: string;
  payload?: any;
}

export const userReducer = (state = initialState, action: UserAction) => {
  switch (action.type) {
    case "STORE_USER": {
      return { ...state, user: action.payload };
    }
    case "REMOVE_USER": {
      return { ...state, user: undefined };
    }
    default:
      return state;
  }
};
