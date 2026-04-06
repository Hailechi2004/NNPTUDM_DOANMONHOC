const dashboardService = require('../services/dashboardService');

async function getDashboardData() {
  return dashboardService.getDashboardData();
}

module.exports = {
  getDashboardData,
};
