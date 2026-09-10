import { Customer, Order, OrderDetails, OrderProduct, ShippingAddress } from "@/types/order";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface GenerateInvoicePDFProps {
  data: OrderDetails;
  shippingAddress: ShippingAddress;
}
export const generateInvoicePDF = ({
   data,
  shippingAddress,
}: GenerateInvoicePDFProps) => {

     const {
    order,
    customer,
    products,
  } = data;
  
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  // ============================================================
  // THEME
  // ============================================================

  const COLOR_INK: [number, number, number] = [
    31, 31, 30,
  ];

  const COLOR_INK_SOFT: [number, number, number] = [
    110, 105, 98,
  ];

  const COLOR_GOLD: [number, number, number] = [
    241, 108, 139,
  ];

  const COLOR_BORDER: [number, number, number] = [
    225, 217, 203,
  ];

  const COLOR_CANCELLED: [number, number, number] = [
    178, 78, 78,
  ];

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 48;

  const contentRight =
    pageWidth - margin;

  const footerHeight = 46;

  const footerTopY =
    pageHeight - footerHeight;

  // ============================================================
  // HELPERS
  // ============================================================

  const tracked = (
    text: string,
    gap = 1
  ) =>
    text
      .toUpperCase()
      .split("")
      .join(" ".repeat(gap));

  const drawPill = (
    text: string,
    rightEdgeX: number,
    y: number,
    fill: [number, number, number],
    textColor: [number, number, number]
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    const label = tracked(text, 0.5);

    const textWidth =
      doc.getTextWidth(label);

    const paddingX = 10;

    const pillWidth =
      textWidth + paddingX * 2;

    const pillHeight = 16;

    const x =
      rightEdgeX - pillWidth;

    doc.setFillColor(...fill);

    doc.roundedRect(
      x,
      y - pillHeight + 4,
      pillWidth,
      pillHeight,
      8,
      8,
      "F"
    );

    doc.setTextColor(...textColor);

    doc.text(
      label,
      x + pillWidth / 2,
      y,
      {
        align: "center",
      }
    );

    return pillWidth;
  };

  // ============================================================
  // DATE
  // ============================================================

  const formattedDate = order.ordered_at
    ? new Date(
        order.ordered_at
      ).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // ============================================================
  // HEADER
  // ============================================================

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLOR_INK);

  doc.text(
    "MomAndChild",
    margin,
    56
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_GOLD);

  doc.text(
    tracked(
      "Baby & Maternity Essentials",
      0.5
    ),
    margin,
    70
  );

  doc.setTextColor(...COLOR_INK_SOFT);
  doc.setFontSize(9);

  doc.text(
    "House 12, Road 4, Banani, Dhaka, Bangladesh",
    margin,
    84
  );

  doc.text(
    "care@momandchild.com",
    margin,
    96
  );

  // ============================================================
  // INVOICE META
  // ============================================================

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLOR_GOLD);

  doc.text(
    tracked("Invoice"),
    contentRight,
    56,
    {
      align: "right",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_INK);

  doc.text(
    order.order_no,
    contentRight,
    72,
    {
      align: "right",
    }
  );

  doc.setTextColor(...COLOR_INK_SOFT);
  doc.setFontSize(9);

  doc.text(
    `Date: ${formattedDate}`,
    contentRight,
    85,
    {
      align: "right",
    }
  );

  const isPaid =
    String(order.payment_status).toLowerCase() ===
    "paid";

  drawPill(
    order.payment_status,
    contentRight,
    103,
    isPaid
      ? [214, 232, 219]
      : [244, 228, 196],
    isPaid
      ? [45, 106, 79]
      : [138, 94, 24]
  );

  // ============================================================
  // DIVIDER
  // ============================================================

  doc.setDrawColor(...COLOR_GOLD);
  doc.setLineWidth(1);

  doc.line(
    margin,
    122,
    contentRight,
    122
  );

  // ============================================================
  // BILLED TO
  // ============================================================

  const sectionY = 150;

  const addressColX = margin;

  const emailColX =
    contentRight - 200;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GOLD);

  doc.text(
    tracked("Billed to", 1),
    addressColX,
    sectionY
  );

  doc.setDrawColor(...COLOR_GOLD);

  doc.line(
    addressColX,
    sectionY + 5,
    addressColX + 26,
    sectionY + 5
  );

  let addressY =
    sectionY + 22;

  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(...COLOR_INK);

  doc.text(
    shippingAddress.name || customer.name,
    addressColX,
    addressY
  );

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLOR_INK_SOFT);
  doc.setFontSize(9);

  if (shippingAddress.phone) {
    addressY += 15;

    doc.text(
      shippingAddress.phone,
      addressColX,
      addressY
    );
  }

  if (shippingAddress.address) {
    addressY += 15;

    doc.text(
      shippingAddress.address,
      addressColX,
      addressY
    );
  }

  if (shippingAddress.city) {
    addressY += 15;

    doc.text(
      `${shippingAddress.city}${
        shippingAddress.zip
          ? ` - ${shippingAddress.zip}`
          : ""
      }`,
      addressColX,
      addressY
    );
  }

  if (customer.email) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_GOLD);

    doc.text(
      tracked("Contact", 1),
      emailColX,
      sectionY
    );

    doc.line(
      emailColX,
      sectionY + 5,
      emailColX + 26,
      sectionY + 5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_INK_SOFT);

    doc.text(
      customer.email,
      emailColX,
      sectionY + 22
    );
  }

  const sectionBottom =
    addressY + 24;

  // ============================================================
  // PRODUCTS
  // ============================================================

  const tableStartY =
    sectionBottom;

  autoTable(doc, {
    startY: tableStartY,

    head: [
      [
        "Item",
        "SKU",
        "Qty",
        "Unit Price",
        "Amount",
      ],
    ],

    body: products.map((item) => {
      const cancelled =
        item.status?.toUpperCase() ===
        "CANCELLED";

      return [
        cancelled
          ? `${item.product.name} (Cancelled)`
          : item.product.name,

        item.product.sku || "-",

        String(item.qty),

        `$${Number(item.price).toFixed(2)}`,

        cancelled
          ? "$0.00"
          : `$${Number(item.subtotal).toFixed(
              2
            )}`,
      ];
    }),

    theme: "plain",

    styles: {
      font: "helvetica",
      fontSize: 8.75,
      textColor: COLOR_INK,

      cellPadding: {
        top: 9,
        bottom: 9,
        left: 10,
        right: 10,
      },

      lineColor: COLOR_BORDER,
      lineWidth: 0.5,
    },

    headStyles: {
      textColor: COLOR_INK,
      fontStyle: "bold",
      fontSize: 8,

      cellPadding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },

      lineColor: COLOR_BORDER,
      lineWidth: 0.5,
    },

    didDrawCell: (data) => {
      if (data.section === "head") {
        doc.setDrawColor(...COLOR_GOLD);
        doc.setLineWidth(1);

        doc.line(
          data.cell.x,
          data.cell.y +
            data.cell.height,
          data.cell.x +
            data.cell.width,
          data.cell.y +
            data.cell.height
        );
      }
    },

    columnStyles: {
      0: {
        cellWidth:
          contentRight -
          margin -
          (75 + 45 + 80 + 85),
      },

      1: {
        cellWidth: 75,
      },

      2: {
        cellWidth: 45,
        halign: "center",
      },

      3: {
        cellWidth: 80,
        halign: "right",
      },

      4: {
        cellWidth: 85,
        halign: "right",
      },
    },

    didParseCell: (data) => {
      if (data.section !== "body") {
        return;
      }

      const rowItem =
        products[data.row.index];

      const cancelled =
        rowItem?.status?.toUpperCase() ===
        "CANCELLED";

      if (cancelled) {
        data.cell.styles.textColor =
          COLOR_CANCELLED;
      }
    },

    margin: {
      left: margin,
      right: margin,
      bottom: footerHeight + 20,
    },
  });

  // ============================================================
  // SUMMARY
  // ============================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY = (doc as any).lastAutoTable.finalY;

  const summaryWidth = 220;

  const summaryX =
    contentRight - summaryWidth;

  const summaryRowHeight = 18;

  const summaryRows = 3;

  const summaryBoxHeight =
    summaryRows *
      summaryRowHeight +
    14 +
    30;

  let summaryTop = tableEndY;

  if (
    summaryTop +
      summaryBoxHeight >
    footerTopY
  ) {
    doc.addPage();

    summaryTop = margin;
  }

  const summaryPadX = 16;

  let rowY =
    summaryTop + 24;

  const summaryLine = (
    label: string,
    value: string,
    emphasize = false
  ) => {
    doc.setFont(
      "helvetica",
      emphasize ? "bold" : "normal"
    );

    doc.setFontSize(9.5);

    doc.setTextColor(
      ...(emphasize
        ? COLOR_INK
        : COLOR_INK_SOFT)
    );

    doc.text(
      label,
      summaryX + summaryPadX,
      rowY
    );

    doc.text(
      value,
      contentRight -
        summaryPadX,
      rowY,
      {
        align: "right",
      }
    );

    rowY += summaryRowHeight;
  };

  summaryLine(
    "Subtotal",
    `$${Number(
      order.subtotal
    ).toFixed(2)}`
  );

  summaryLine(
    "Shipping",
    `$${Number(
      order.shipping_rate
    ).toFixed(2)}`
  );

  summaryLine(
    "Coupon Discount",
    `$${(Number(order.subtotal) * Number(order.coupon_discount || 0)) / 100}`
  );

  summaryLine(
    "Discount",
    `$${Number(
      order.discount
    ).toFixed(2)}`
  );

  doc.setDrawColor(...COLOR_GOLD);
  doc.setLineWidth(1);

  doc.line(
    summaryX + summaryPadX,
    rowY + 2,
    contentRight -
      summaryPadX,
    rowY + 2
  );

  rowY += 24;

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_INK);

  doc.text(
    "Total",
    summaryX + summaryPadX,
    rowY
  );

  doc.setTextColor(...COLOR_GOLD);

  doc.text(
    `$${Number(
      order.total
    ).toFixed(2)}`,
    contentRight -
      summaryPadX,
    rowY,
    {
      align: "right",
    }
  );

  // ============================================================
  // FOOTER
  // ============================================================

  const totalPages =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    doc.setPage(page);

    doc.setDrawColor(
      ...COLOR_BORDER
    );

    doc.setLineWidth(0.75);

    doc.line(
      margin,
      footerTopY,
      contentRight,
      footerTopY
    );

    doc.setFont(
      "times",
      "italic"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      ...COLOR_INK
    );

    doc.text(
      "Thank you for shopping with MomAndChild!",
      pageWidth / 2,
      footerTopY + 28,
      {
        align: "center",
      }
    );
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================

  doc.save(
    `Invoice-${order.order_no}.pdf`
  );
};