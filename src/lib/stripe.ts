// Path: src/lib/stripe.ts
export const stripe = {
  webhooks: {
    constructEvent: () => {
      throw new Error('Stripe is disabled');
    }
  }
};