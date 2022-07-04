export const listReducer = (state, action) => {
  if (state === undefined) {
    return [];
  }
  switch (action.type) {
    case 'List_Update': {
      return { ...state, list: action.list };
    }
  }
  return { ...state };
};
