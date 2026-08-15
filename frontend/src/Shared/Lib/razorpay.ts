declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export interface RazorpayOptions {
  key?: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onModalDismiss?: () => void;
}

export const openRazorpayModal = async (options: RazorpayOptions): Promise<boolean> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    console.error("Razorpay SDK failed to load");
    return false;
  }

  const rzpKey = options.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TQ2S5aeTiHyuFQ";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkoutConfig: any = {
    key: rzpKey,
    amount: options.amount,
    currency: options.currency || "INR",
    name: options.name || "PG Accommodation Payment",
    description: options.description || "Room Booking & Rent Payment",
    handler: options.handler,
    prefill: options.prefill || {},
    theme: {
      color: "#2563eb",
    },
    modal: {
      ondismiss: () => {
        if (options.onModalDismiss) options.onModalDismiss();
      },
    },
  };

  if (options.order_id && !options.order_id.startsWith("order_mock_")) {
    checkoutConfig.order_id = options.order_id;
  }

  const razorpay = new window.Razorpay(checkoutConfig);
  razorpay.on("payment.failed", (response: { error: { description: string } }) => {
    console.error("Payment failed:", response.error);
  });
  razorpay.open();
  return true;
};
