const { query, queryOne } = require('../utils/db');

const STATUS_LABELS = {
  Pending: 'Chờ thanh toán',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Done: 'Hoàn tất',
  Cancelled: 'Đã hủy',
};

function formatOrder(row) {
  return {
    id: `ORD-${String(row.id).padStart(4, '0')}`,
    rawId: row.id,
    customer: row.customer_name,
    date: new Date(row.order_date).toISOString().slice(0, 10),
    total: Number(row.total_amount),
    status: STATUS_LABELS[row.status] || row.status,
  };
}

async function getDashboardData() {
  const statsRow = await queryOne(
    `SELECT
       (SELECT COUNT(*) FROM orders) AS totalOrders,
       (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('Delivered', 'Done')) AS totalRevenue,
       (SELECT COALESCE(SUM(stock), 0) FROM parts) AS totalStock,
       (SELECT COUNT(*) FROM customers) AS totalCustomers,
       (SELECT COUNT(*) FROM parts WHERE stock <= 5) AS lowStockParts`
  );

  const recentOrderRows = await query(
    `SELECT o.id, o.order_date, o.total_amount, o.status, c.full_name AS customer_name
     FROM orders o
     INNER JOIN customers c ON c.id = o.customer_id
     ORDER BY o.order_date DESC, o.id DESC
     LIMIT 5`
  );

  const topProductRows = await query(
    `SELECT
       p.id,
       p.name,
       p.image,
       c.name AS category_name,
       SUM(od.quantity) AS sold_count
     FROM order_details od
     INNER JOIN parts p ON p.id = od.part_id
     LEFT JOIN categories c ON c.id = p.category_id
     GROUP BY p.id, p.name, p.image, c.name
     ORDER BY sold_count DESC, p.name ASC
     LIMIT 5`
  );

  return {
    stats: {
      totalOrders: Number(statsRow.totalOrders || 0),
      totalRevenue: Number(statsRow.totalRevenue || 0),
      totalStock: Number(statsRow.totalStock || 0),
      totalCustomers: Number(statsRow.totalCustomers || 0),
      lowStockParts: Number(statsRow.lowStockParts || 0),
    },
    recentOrders: recentOrderRows.map(formatOrder),
    topProducts: topProductRows.map((row) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      category: row.category_name || 'Chưa phân loại',
      soldCount: Number(row.sold_count || 0),
    })),
  };
}

module.exports = {
  getDashboardData,
};
