function getNextId(items, field = 'id') {
  if (!Array.isArray(items) || items.length === 0) {
    return 1;
  }

  const numericIds = items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));

  if (numericIds.length === 0) {
    return 1;
  }

  return Math.max(...numericIds) + 1;
}

module.exports = {
  getNextId,
};
