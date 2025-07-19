import allUsers from './slices/allUsers';
import userReducer from './slices/allUserSlice';
import icdReducer from './slices/icdsSlice';
import forwarderReducer from './slices/forwarderSlice';
import containerTypeReducer from './slices/containerTypesSlice';
import expectedContainerReducer from './slices/expectedArrivalSlice';
import containerReducer from './slices/containerSlice';
import yardReducer from './slices/yardSlice';
import transporterReducer from './slices/transporterSlice';
import arrivalContainerReducer from './slices/arrivalContainerSlice';
import auth from './slices/auth';
import banners from './slices/banners';
import gyms from './slices/gyms';
import trainers from './slices/trainers';
import leads from './slices/leads';
import transactions from './slices/transactions';
import attendanceSlice from  './slices/attendance'


const rootReducer = {
    allUsers:allUsers,
    users: userReducer,
    forwarders: forwarderReducer,
    containerTypes: containerTypeReducer,
    expectedContainer: expectedContainerReducer,
    transporters: transporterReducer,
    container: containerReducer,
    yards: yardReducer,
    icd: icdReducer,
    auth:auth,
    banners:banners,
    arrivalContainer: arrivalContainerReducer,
    gyms,
    leads,
    trainers,
    transactions,
    attendance:attendanceSlice
};

export default rootReducer;