// backend/src/pdfCreator/internalOrder.template.ts

type InternalOrderTemplateParams = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsHtml: string;
  shippingHtml: string;
  total: string;
};

export const internalOrderHtml = ({
  companyName,
  companyAddress,
  companyPhone,
  orderNumber,
  createdAt,
  customerName,
  customerEmail,
  itemsHtml,
  shippingHtml,
  total,
}: InternalOrderTemplateParams): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      padding: 24px;
    }
    h1, h2, h3 {
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
    }
    .section {
      margin-top: 16px;
    }
    .total {
      margin-top: 12px;
      text-align: right;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <h1>Internal Order</h1>

  <div class="section">
    <strong>Company</strong><br/>
    ${companyName}<br/>
    ${companyAddress}<br/>
    ${companyPhone}
  </div>

  <div class="section">
    <strong>Order Number:</strong> ${orderNumber}<br/>
    <strong>Date:</strong> ${createdAt}
  </div>

  <div class="section">
    <strong>Customer</strong><br/>
    Name: ${customerName}<br/>
    Email: ${customerEmail}
  </div>

  <div class="section">
    <strong>Shipping</strong><br/>
    ${shippingHtml}
  </div>

  <div class="section">
    <h3>Items</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total">
      Total: ${total}
    </div>
  </div>
</body>
</html>
`;
