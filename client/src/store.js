import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers'; // imports index.js in reducers folder

const initialState = {}

const middleware = [thunk]; // add middleware we want to this array

const store = createStore(
  rootReducer, 
  initialState, 
  compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // implement Redux devtools in Chrome
  )
);

export default store;

