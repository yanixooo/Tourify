# Tourify

A tour booking platform built with TypeScript, Express, and MongoDB.

🌐 **Live Demo:** [https://web-production-8512b.up.railway.app](https://web-production-8512b.up.railway.app)

## Tech Stack

- **TypeScript** + **Express 5**
- **MongoDB** + **Mongoose**
- **Stripe** for payments
- **Mapbox** for maps
- **JWT** authentication
- **Pug** templates

## Getting Started

```bash
# Install
npm install

# Development
npm run dev

# Run tests
npm run test

# Build
npm run build
```

## Environment Variables

Copy `.env.example` to `config.env` and fill in:

- `DATABASE` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API key
- `EMAIL_*` - SMTP settings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |

## License

ISC
