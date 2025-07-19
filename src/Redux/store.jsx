import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import { combineReducers } from 'redux';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
};

const rootReducer2 = combineReducers(rootReducer);

const persistedReducer = persistReducer(persistConfig, rootReducer2);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);