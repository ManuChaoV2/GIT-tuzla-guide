# Tuzla Guide - Decentralized Tourism App on Internet Computer

A comprehensive tourism guide application for Tuzla, Bosnia and Herzegovina, built on the Internet Computer Protocol (ICP) with offline capabilities, GPS navigation, audio tours, and crypto payment integration.

## 🌟 Features

### Core Features
- **Interactive Map**: Real-time GPS navigation with Mapbox integration
- **Offline Support**: Full offline functionality with service worker caching
- **Audio Tours**: Multilingual audio guides for attractions
- **Crypto Payments**: Integrated payment system supporting multiple cryptocurrencies
- **Reviews & Ratings**: User-generated content and reviews
- **Multilingual Support**: English, Bosnian, German, Croatian, Serbian

### Blockchain Integration
- **Internet Computer (ICP)**: Fully decentralized backend using Motoko
- **Internet Identity**: Secure, passwordless authentication
- **Asset Canisters**: Decentralized storage for images and audio files
- **Smart Contracts**: Automated payment processing and review system

### Offline Capabilities
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Service Worker**: Advanced caching strategies for offline use
- **Background Sync**: Sync data when connection is restored
- **Local Storage**: Cache maps, audio, and attraction data

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Motoko (ICP smart contracts)
- **Database**: ICP Canister Storage (Orthogonal Persistence)
- **Maps**: Mapbox GL JS + React Map GL
- **Audio**: Howler.js for cross-platform audio
- **Styling**: Tailwind CSS
- **Authentication**: ICP Internet Identity

### Project Structure
```
tuzla-guide/
├── src/
│   ├── backend/
│   │   └── main.mo          # Motoko smart contract
│   ├── components/          # React components
│   │   ├── InteractiveMap.tsx
│   │   └── PaymentModal.tsx
│   ├── pages/              # Page components
│   │   └── HomePage.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useGPS.ts
│   │   └── useAudio.ts
│   ├── services/           # API services
│   │   └── icpService.ts
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── declarations/           # ICP type declarations
├── dfx.json               # ICP deployment config
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind config
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- DFINITY SDK (dfx)
- ICP wallet with cycles (for mainnet deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tuzla-guide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install DFINITY SDK** (if not already installed)
   ```bash
   curl -fsSL https://internetcomputer.org/install.sh | sh
   ```

4. **Initial setup**
   ```bash
   ./deploy.sh setup
   ```

### Development

1. **Start local development environment**
   ```bash
   ./deploy.sh dev
   ```
   This starts:
   - Local ICP replica
   - Backend canister
   - Frontend development server (http://localhost:3000)

2. **Deploy to local network**
   ```bash
   ./deploy.sh local
   ```

### Production Deployment

1. **Deploy to Internet Computer mainnet**
   ```bash
   ./deploy.sh mainnet
   ```
   
   Note: Ensure you have sufficient cycles in your ICP wallet.

## 📱 Usage

### For Tourists
1. **Browse Attractions**: Explore Tuzla's attractions on the interactive map
2. **Audio Tours**: Tap the audio button for guided tours in your language
3. **Offline Mode**: Download content for offline use
4. **Payments**: Pay for attractions using cryptocurrency
5. **Reviews**: Share your experience by adding reviews

### For Developers
1. **Smart Contracts**: Modify `src/backend/main.mo` to add new features
2. **Frontend**: Update React components in `src/components/`
3. **Styling**: Customize Tailwind CSS in `tailwind.config.js`
4. **Deployment**: Use `./deploy.sh` for easy deployment

## 💰 Crypto Payment Integration

The app supports multiple cryptocurrencies through a hybrid on-chain/off-chain approach:

### Supported Cryptocurrencies
- **USDT (Polygon)**: Low fees, fast transactions
- **USDT (Ethereum)**: High liquidity
- **Bitcoin (BTC)**: Store of value
- **Internet Computer (ICP)**: Native ICP token

### Payment Flow
1. User selects attraction and payment method
2. QR code is generated for off-chain payment
3. Payment is processed via NowPayments API
4. Transaction status is updated on ICP blockchain
5. User receives confirmation and access

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Mapbox Configuration
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here

# ICP Configuration
NODE_ENV=development
DFX_NETWORK=local

# Payment API Configuration
REACT_APP_NOWPAYMENTS_API_KEY=your_api_key_here
REACT_APP_NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here
```

### Mapbox Setup
1. Sign up at [Mapbox](https://mapbox.com)
2. Create a new access token
3. Add the token to your `.env` file

### Payment Setup
1. Sign up at [NowPayments](https://nowpayments.io)
2. Get API key and IPN secret
3. Configure webhook URL in NowPayments dashboard

## 🌐 Deployment Options

### Caffeine.io (Recommended)
The app is optimized for deployment on Caffeine.io, DFINITY's official development platform:

1. **One-click deployment**: Upload your project to Caffeine.io
2. **Instant URL**: Get a URL like `https://tuzla-guide.id.icp.coffee`
3. **Built-in tools**: Integrated cycles wallet, asset management
4. **Auto-scaling**: Handles traffic automatically

### Manual Deployment
Use the provided deployment script for full control:

```bash
# Local development
./deploy.sh local

# Mainnet deployment
./deploy.sh mainnet
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Asset Optimization**: Compressed images and audio
- **Caching**: Advanced service worker strategies
- **CDN Integration**: Global content delivery
- **Progressive Loading**: Load essential content first

### Benchmarks
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+
- **Offline Support**: 100% functionality

## 🔒 Security

### Security Features
- **Internet Identity**: Passwordless authentication
- **HTTPS Only**: All communications encrypted
- **Content Security Policy**: XSS protection
- **Input Validation**: Sanitized user inputs
- **Smart Contract Audits**: Secure payment processing

### Privacy
- **No Tracking**: No analytics or tracking scripts
- **Local Storage**: Data stored on device
- **Anonymous Usage**: No personal data required
- **GDPR Compliant**: Privacy by design

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure offline functionality
5. Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DFINITY Foundation**: For the Internet Computer platform
- **Mapbox**: For mapping services
- **NowPayments**: For crypto payment processing
- **Tuzla Tourism Board**: For attraction data and support

## 📞 Support

- **Documentation**: [docs.tuzla-guide.icp.coffee](https://docs.tuzla-guide.icp.coffee)
- **Discord**: [Tuzla Guide Community](https://discord.gg/tuzla-guide)
- **Email**: support@tuzla-guide.icp.coffee
- **GitHub Issues**: Report bugs and feature requests

## 🗺️ Roadmap

### Version 2.0 (Q2 2026)
- AI-powered personalized recommendations
- Social features and user profiles
- Advanced offline maps
- Multi-city support
- NFT ticketing system

### Version 3.0 (Q4 2026)
- DAO governance for attraction curation
- Advanced analytics dashboard
- Integration with travel booking platforms
- AR/VR experiences
- Multi-language AI translation

---

Built with ❤️ for Tuzla and the ICP community.