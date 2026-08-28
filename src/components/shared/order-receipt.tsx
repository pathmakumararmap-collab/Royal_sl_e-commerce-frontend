import { siteConfig } from "@/lib/constants/site";
import { formatDateTime } from "@/lib/format";
import type { Invoice, Order } from "@/types/order";

interface OrderReceiptProps {
  order: Order;
  invoice?: Invoice | null;
  changeDue?: number;
}

/**
 * A thermal-receipt-styled printout, hidden on screen and shown only when
 * printing (see the `@media print` rules in globals.css that isolate
 * `#order-receipt-print-area` as the only visible content on the page).
 * Sized for 80mm POS paper — most thermal receipt printers install as a
 * normal Windows/macOS printer, so the browser's own print dialog covers
 * printer selection with no extra software needed.
 */
export function OrderReceipt({ order, invoice, changeDue }: OrderReceiptProps) {
  // On a fresh POS sale, changeDue comes straight from the checkout
  // response. On a later reprint, we recover the same figures from the
  // payment record's stored meta (see PosService::checkout).
  const storedMeta = order.payments?.find((payment) => payment.meta?.amount_tendered != null)?.meta;
  const amountTendered = typeof changeDue === "number" ? order.total_amount + changeDue : storedMeta?.amount_tendered;
  const resolvedChangeDue = typeof changeDue === "number" ? changeDue : storedMeta?.change_due;
  const isReprint = typeof changeDue !== "number";

  return (
    <div id="order-receipt-print-area" className="hidden print:block">
      <div className="mx-auto w-[80mm] px-2 py-3 font-mono text-[11px] leading-tight text-black">
        <div className="text-center">
          <p className="text-sm font-bold">{siteConfig.name}</p>
          <p>{siteConfig.contact.address}</p>
          <p>{siteConfig.contact.phone}</p>
        </div>

        {isReprint && (
          <p className="mt-1 text-center text-sm font-bold tracking-wide">*** REPRINT ***</p>
        )}

        <div className="my-2 border-t border-dashed border-black" />

        <div className="flex justify-between">
          <span>Order</span>
          <span>{order.order_no}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{formatDateTime(order.created_at)}</span>
        </div>
        {order.customer_name && (
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{order.customer_name}</span>
          </div>
        )}
        {invoice && (
          <div className="flex justify-between">
            <span>Invoice</span>
            <span>{invoice.invoice_no}</span>
          </div>
        )}

        <div className="my-2 border-t border-dashed border-black" />

        {order.items?.map((item) => (
          <div key={item.id} className="mb-1">
            <div className="flex justify-between">
              <span>{item.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {item.quantity} x {item.unit_price.toFixed(2)}
              </span>
              <span>{item.subtotal.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="my-2 border-t border-dashed border-black" />

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{order.discount_amount.toFixed(2)}</span>
          </div>
        )}
        {order.tax_amount > 0 && (
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{order.tax_amount.toFixed(2)}</span>
          </div>
        )}
        {order.shipping_amount > 0 && (
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="my-2 border-t border-dashed border-black" />

        <div className="flex justify-between text-sm font-bold">
          <span>Total</span>
          <span>
            {order.currency} {order.total_amount.toFixed(2)}
          </span>
        </div>
        {typeof amountTendered === "number" ? (
          <div className="flex justify-between">
            <span>Cash tendered</span>
            <span>{amountTendered.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{order.paid_amount.toFixed(2)}</span>
          </div>
        )}
        {typeof resolvedChangeDue === "number" && resolvedChangeDue > 0 && (
          <div className="flex justify-between">
            <span>Change</span>
            <span>{resolvedChangeDue.toFixed(2)}</span>
          </div>
        )}

        <div className="my-2 border-t border-dashed border-black" />

        <p className="text-center">Thank you for shopping with us!</p>
      </div>
    </div>
  );
}