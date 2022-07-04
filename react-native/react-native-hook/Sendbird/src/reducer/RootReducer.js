import { listReducer } from './listReducer';
import { combineReducers } from 'redux';

const appReducer = combineReducers({
  listReducer: listReducer,
});

const RootReducer = (state, action) => {
  return appReducer(state, action);
};

export default RootReducer;
