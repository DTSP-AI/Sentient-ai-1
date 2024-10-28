// Path: src/lib/stripe.ts
export const stripe = {
  webhooks: {
    constructEvent: () => {
      throw new Error('Stripe is disabled');
    }
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 6be64db33c438bc5af241500909ab28087d5487d
