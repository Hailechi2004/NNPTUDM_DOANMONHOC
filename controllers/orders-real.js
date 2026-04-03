const { query, queryOne } = require('../utils/db');
const { ensureAppSchema } = require('../utils/dbMigration');

const STATUS_LABELS = {
  Pending: 'Chờ thanh toán',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Done: 'Hoàn tất',
  Cancelled: 'Đã hủy',
};

const STATUS_INPUT_TO_DB = {
  'Chờ thanh toán': 'Pending',
  'Đang xử lý': 'Processing',
  'Đang giao': 'Shipped',
  'Đã giao': 'Delivered',
  'Hoàn tất': 'Done',
  'Đã hủy': 'Cancelled',
  Pending: 'Pending',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Done: 'Done',
  Cancelled: 'Cancelled',
};

function mapOrderRow(row) {
  return {
    id: `ORD-${String(row.id).padStart(4, '0')}`,
    rawId: row.id,
    customer: row.customer_name,
    date: new Date(row.order_date).toISOString().slice(0, 10),
    total: Number(row.total_amount),
    status: STATUS_LABELS[row.status] || row.status,
    address: row.shipping_address,
  };
}

async function listOrders() {
  await ensureAppSchema();
  const rows = await query(
    `SELECT o.id, o.order_date, o.total_amount, o.status, o.shipping_address, c.full_name AS customer_name
     FROM orders o
     INNER JOIN customers c ON c.id = o.customer_id
     ORDER BY o.order_date DESC, o.id DESC`
  );
  return rows.map(mapOrderRow);
}

async function findOrderById(id) {
  await ensureAppSchema();
  const numericId = String(id).startsWith('ORD-') ? Number(String(id).replace('ORD-', '')) : Number(id);
  const row = await queryOne(
    `SELECT o.id, o.order_date, o.total_amount, o.status, o.shipping_address, c.full_name AS customer_name
     FROM orders o
     INNER JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ?
     LIMIT 1`,
    [numericId]
  );

  if (!row) {
    return null;
  }

  const items = await query(
    `SELECT
       od.part_id,
       od.quantity,
       od.unit_price,
       od.promotion_code,
       od.discount_amount,
       COALESCE(od.product_name, p.name) AS product_name,
       COALESCE(od.product_image, p.image) AS product_image
     FROM order_details od
     LEFT JOIN parts p ON p.id = od.part_id
     WHERE od.order_id = ?
     ORDER BY od.id ASC`,
    [numericId]
  );

  return {
    ...mapOrderRow(row),
    items: items.map((item) => ({
      partId: item.part_id,
      name: item.product_name || 'Sản phẩm',
      image: item.product_image || '',
      qty: Number(item.quantity),
      price: Number(item.unit_price),
      originalUnitPrice: Number(item.discount_amount || 0) > 0
        ? Number(item.unit_price) + Number(item.discount_amount || 0)
        : null,
      promotionCode: item.promotion_code,
      discountAmount: Number(item.discount_amount || 0),
      lineTotal: Number(item.quantity) * Number(item.unit_price),
    })),
  };
}

async function updateOrderStatus(id, status) {
  await ensureAppSchema();
  const numericId = String(id).startsWith('ORD-') ? Number(String(id).replace('ORD-', '')) : Number(id);
  const dbStatus = STATUS_INPUT_TO_DB[status] || 'Pending';
  await query('UPDATE orders SET status = ? WHERE id = ?', [dbStatus, numericId]);
  return findOrderById(numericId);
}

async function deleteOrder(id) {
  await ensureAppSchema();
  const numericId = String(id).startsWith('ORD-') ? Number(String(id).replace('ORD-', '')) : Number(id);
  const result = await query('DELETE FROM orders WHERE id = ?', [numericId]);
  return result.affectedRows > 0;
}

module.exports = {
  deleteOrder,
  findOrderById,
  listOrders,
  updateOrderStatus,
};
