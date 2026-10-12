const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Genera un PDF de factura profesional
 * @param {Object} factura - Datos de la factura
 * @param {Object} cliente - Datos del cliente
 * @param {Array} items - Items/productos de la factura
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generarPDFFactura(factura, cliente, items = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);


      // ========== ENCABEZADO ==========

      // Tipo de factura (cuadro grande)
      const tipoX = 250;
      doc.rect(tipoX, 0, 50, 50).stroke();
      doc.fontSize(35).text(factura.tipo_factura, tipoX, 10, 50);
      doc
        .fontSize(10)
        .text(
          "COD. " + getCodigoTipoFactura(factura.tipo_factura),
          tipoX, 40,
          50
        );
         // Línea separadora vertical
      doc.moveTo(270, 55).lineTo(270, 190).stroke()

      // ========== DATOS DEL EMISOR ==========
      const logoPath = path.join(__dirname, "../../assets/pumax_logo.png");
      doc.image(logoPath, 50, 50, {
        width: 200, // o height: 50
      });
      doc.fontSize(9).font("Helvetica");
      doc.text("Razón Social: Pumax", 50, 135);
      doc.text("CUIT: 30-12345678-9", 50, 147);
      doc.text("Domicilio: Av. San Martín 1234, Mendoza", 50, 159);
      doc.text("IVA: Responsable Inscripto", 50, 171);

      // ========== DATOS DE LA FACTURA ==========
      const tipoXX = 350;
      doc.fontSize(20).font("Helvetica-Bold").text("FACTURA", tipoXX, 50);
      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("Número:", tipoXX, 120);
      doc.text("Fecha Emisión:", tipoXX, 135);
      doc.text("Punto de Venta:", tipoXX, 150);
      if (factura.cae) {
        doc.text("CAE:", tipoXX, 165);
        doc.text("Venc. CAE:", tipoXX, 180);
      }

      doc.font("Helvetica");
      doc.text(String(factura.numero_factura || ""), tipoXX + 80, 120, {
        width: 100,
      });
      doc.text(
        String(formatearFecha(factura.fecha_emision) || ""),
        tipoXX + 80,
        135,
        { width: 100 }
      );
      doc.text(String(factura.punto_venta || "00001"), tipoXX + 80, 150, {
        width: 100,
      });
      if (factura.cae) {
        doc.text(String(factura.cae || ""), tipoXX + 80, 165, { width: 100 });
        doc.text(
          String(formatearFecha(factura.vencimiento_cae) || ""),
          tipoXX + 80,
          180,
          { width: 100 }
        );
      }

      // Línea separadora
      doc.moveTo(50, 200).lineTo(550, 200).stroke();

      // ========== DATOS DEL CLIENTE ==========
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("DATOS DEL CLIENTE", 50, 210);
      doc.fontSize(9).font("Helvetica");

      let yCliente = 230;
      doc.text(
        `Cliente: ${cliente.razon_social || cliente.nombre}`,
        50,
        yCliente
      );
      if (cliente.cuit) {
        doc.text(`CUIT/CUIL: ${cliente.cuit}`, 50, yCliente + 15);
      }
      if (cliente.domicilio) {
        doc.text(`Domicilio: ${cliente.domicilio}`, 50, yCliente + 30);
      }
      doc.text(
        `Condición IVA: ${formatearCondicionIVA(cliente.condicion_iva)}`,
        50,
        yCliente + 45
      );

      // Línea separadora
      doc.moveTo(50, 290).lineTo(550, 290).stroke();

      // ========== TABLA DE ITEMS ==========
      let yTabla = 300;
      doc.fontSize(10).font("Helvetica-Bold");

      // Encabezados de tabla
      doc.text("Cant.", 55, yTabla);
      doc.text("Descripción", 100, yTabla);
      doc.text("Precio Unit.", 350, yTabla);
      doc.text("Subtotal", 470, yTabla);

      doc
        .moveTo(50, yTabla + 15)
        .lineTo(550, yTabla + 15)
        .stroke();

      // Items
      doc.font("Helvetica");
      yTabla += 25;

      if (items && items.length > 0) {
        items.forEach((item, index) => {
          if (yTabla > 700) {
            // Nueva página si se excede el espacio
            doc.addPage();
            yTabla = 50;

            // Re-dibujar encabezados
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Cant.", 55, yTabla);
            doc.text("Descripción", 100, yTabla);
            doc.text("Precio Unit.", 350, yTabla);
            doc.text("Subtotal", 470, yTabla);
            doc
              .moveTo(50, yTabla + 15)
              .lineTo(550, yTabla + 15)
              .stroke();
            doc.font("Helvetica");
            yTabla += 25;
          }

          const cantidad = item.cantidad || 1;
          const descripcion =
            item.producto?.descripcion ||
            item.producto?.nombre ||
            item.descripcion ||
            "Producto";
          const precioUnitario = parseFloat(
            item.precio_unitario || item.precio || 0
          );
          const subtotal = cantidad * precioUnitario;

          doc.text(cantidad.toString(), 55, yTabla);
          doc.text(descripcion, 100, yTabla, { width: 240 });
          doc.text(`$ ${formatearMonto(precioUnitario)}`, 350, yTabla);
          doc.text(`$ ${formatearMonto(subtotal)}`, 470, yTabla);

          yTabla += 20;
        });
      } else {
        doc.text("(Sin detalle de items)", 100, yTabla);
        yTabla += 20;
      }

      // Línea antes de totales
      doc
        .moveTo(50, yTabla + 10)
        .lineTo(550, yTabla + 10)
        .stroke();

      // ========== TOTALES ==========
      yTabla += 25;
      doc.font("Helvetica-Bold");

      const totalX = 400;
      const valorX = 490;

      doc.text("Subtotal:", totalX, yTabla);
      doc
        .font("Helvetica")
        .text(`$ ${formatearMonto(factura.subtotal)}`, valorX, yTabla);

      // Mostrar IVA solo si corresponde
      if (
        factura.tipo_factura === "A" ||
        factura.iva_21 > 0 ||
        factura.iva_105 > 0
      ) {
        yTabla += 20;
        doc.font("Helvetica-Bold");
        if (factura.iva_21 > 0) {
          doc.text("IVA 21%:", totalX, yTabla);
          doc
            .font("Helvetica")
            .text(`$ ${formatearMonto(factura.iva_21)}`, valorX, yTabla);
          yTabla += 20;
          doc.font("Helvetica-Bold");
        }
        if (factura.iva_105 > 0) {
          doc.text("IVA 10.5%:", totalX, yTabla);
          doc
            .font("Helvetica")
            .text(`$ ${formatearMonto(factura.iva_105)}`, valorX, yTabla);
          yTabla += 20;
          doc.font("Helvetica-Bold");
        }
      }

      // Total final
      yTabla += 5;
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("TOTAL:", totalX, yTabla);
      doc.text(`$ ${formatearMonto(factura.total)}`, valorX, yTabla);

      // ========== OBSERVACIONES ==========
      if (factura.observaciones) {
        yTabla += 40;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Observaciones:", 50, yTabla);
        doc.fontSize(9).font("Helvetica");
        doc.text(factura.observaciones, 50, yTabla + 15, { width: 500 });
      }

      // ========== PIE DE PÁGINA ==========
      const piePagina = 750;
      doc.fontSize(8).font("Helvetica");
      doc.text(
        "Este comprobante cumple con la legislación vigente",
        50,
        piePagina,
        {
          align: "center",
          width: 500,
        }
      );

      if (factura.tipo_factura !== "NEGRO") {
        doc.text(
          "Documento válido como factura electrónica",
          50,
          piePagina + 12,
          {
            align: "center",
            width: 500,
          }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ========== FUNCIONES AUXILIARES ==========

function getCodigoTipoFactura(tipo) {
  const codigos = {
    A: "01",
    B: "06",
    C: "11",
    NEGRO: "99",
  };
  return codigos[tipo] || "99";
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function formatearMonto(monto) {
  return parseFloat(monto)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatearCondicionIVA(condicion) {
  const condiciones = {
    RI: "Responsable Inscripto",
    MONOTRIBUTO: "Monotributo",
    EXENTO: "Exento",
    CONSUMIDOR_FINAL: "Consumidor Final",
  };
  return condiciones[condicion] || condicion;
}

module.exports = {
  generarPDFFactura,
};
