const categoryService = require('../services/categoryService');

async function listCategories() {
  return categoryService.listCategories();
}

async function findCategoryById(id) {
  return categoryService.findCategoryById(id);
}

async function createCategory(payload) {
  return categoryService.createCategory(payload);
}

async function updateCategory(id, payload) {
  return categoryService.updateCategory(id, payload);
}

async function deleteCategory(id) {
  return categoryService.deleteCategory(id);
}

module.exports = {
  createCategory,
  deleteCategory,
  findCategoryById,
  listCategories,
  updateCategory,
};
