document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.

  //this block makes you get key from server documentation says its publishable therefore unneeded?
  /*
  // const {publishableKey} = await fetch('/config').then((r) => r.json());
  // if (!publishableKey) {
  //   addMessage(
  //     'No publishable key returned from the server. Please check `.env` and try again'
  //   );
  //   alert('Please set your Stripe publishable API ey in the .env file');
  // }
  // const stripe = Stripe(publishableKey, {
  //   apiVersion: '2020-08-27',
  // });
*/
const stripe= Stripe('pk_test_51J2RhJGw4aurOeswHqLfFCWpq80yCYnAvWtR7Gvwp7INzY9hBIdpb28FmfCqML2hn9XYGpuUnq2GnqYITDFORwKT00OfbzTSfH')

  const elements = stripe.elements();
  const card = elements.create('card');
  card.mount('#card-element');
  const amountInput = document.querySelector('#amount');

  // When the form is submitted...
  const form = document.getElementById('payment-form');
  let submitted = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if(submitted) { return; }
    submitted = true;
    form.querySelector('button').disabled = true;

    // Make a call to the server to create a new
    // payment intent and store its client_secret.
    const {error: backendError, clientSecret} = await fetch(
      'https://swipe-host.herokuapp.com/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'usd',
          paymentMethodType: 'card',
          amount: amountInput.value
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');

    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: nameInput.value,
          },
        },
      }
    );

    if (stripeError) {
      addMessage(stripeError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});
