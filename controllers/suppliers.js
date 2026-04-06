const supplierService = require('../services/supplierService');

async function listSuppliers() {
  return supplierService.listSuppliers();
}

async function findSupplierById(id) {
  return supplierService.findSupplierById(id);
}

async function createSupplier(payload) {
  return supplierService.createSupplier(payload);
}

async function updateSupplier(id, payload) {
  return supplierService.updateSupplier(id, payload);
}

async function deleteSupplier(id) {
  return supplierService.deleteSupplier(id);
}

module.exports = {
  createSupplier,
  deleteSupplier,
  findSupplierById,
  listSuppliers,
  updateSupplier,
};
