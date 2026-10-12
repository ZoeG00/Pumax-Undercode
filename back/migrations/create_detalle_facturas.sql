-- Crear tabla detalle_facturas para guardar los items de cada factura

CREATE TABLE IF NOT EXISTS detalle_facturas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  factura_id BIGINT NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,

  -- Foreign Keys
  FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,

  -- Indexes
  INDEX idx_factura_id (factura_id),
  INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
