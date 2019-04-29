import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function(state = initialState, action) {
  const { type, payload } = action;
  
  switch(type) { 
    case SET_ALERT: // adds a new alert to the alerts array
      return [...state, payload]
    case REMOVE_ALERT: // return all alerts except for the one that matches the specified payload
      return state.filter(alert => alert.id !== payload); 
    default: 
      return state
  }
}