import stripe from 'stripe'

const Stripe = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null

export default Stripe