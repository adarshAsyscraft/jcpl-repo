import request from './request';

const adminService = {
  get: (params) =>request.get('/admin/get-details'),
  getRole: (params) =>request.get('/roles'),
 getDashboardData: (params) =>request.get('/admin/get-dashboard'),
     
};

export default adminService;