type ShippingInfoTemplateParams = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingHtml: string;
};

export const shippingInfoHtml = ({
  companyName,
  companyAddress,
  companyPhone,
  orderNumber,
  customerName,
  customerEmail,
  shippingHtml,
}: ShippingInfoTemplateParams): string => {
  return `
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
    h1 {
      margin-bottom: 12px;
    }
    .section {
      margin-top: 16px;
    }
    .box {
      border: 1px dashed #000;
      padding: 12px;
      margin-top: 12px;
    }
  </style>
</head>

<body>
  <h1>Shipping Label</h1>

  <div class="section">
    <strong>From:</strong><br/>
    ${companyName}<br/>
    ${companyAddress}<br/>
    ${companyPhone}
  </div>

  <div class="section">
    <strong>Order:</strong> ${orderNumber}
  </div>

  <div class="section">
    <strong>Customer:</strong><br/>
    ${customerName}<br/>
    ${customerEmail}
  </div>

  <div class="section box">
    <strong>Ship To:</strong><br/>
    ${shippingHtml}
  </div>
</body>
</html>
`;
};
