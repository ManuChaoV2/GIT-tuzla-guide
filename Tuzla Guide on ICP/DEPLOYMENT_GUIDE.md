# Tuzla Guide - Deployment Guide

This guide provides detailed instructions for deploying the Tuzla Guide application on the Internet Computer using Caffeine.io and other deployment methods.

## 🎯 Deployment Options

### 1. Caffeine.io (Recommended)
The easiest way to deploy your Tuzla Guide app.

### 2. Manual DFX Deployment
Full control over the deployment process.

### 3. Docker Deployment
Container-based deployment for development/testing.

## 🚀 Caffeine.io Deployment

### Prerequisites
- GitHub account
- ICP wallet with cycles
- Completed Tuzla Guide project

### Steps

1. **Prepare Your Project**
   ```bash
   # Ensure all files are committed
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Sign Up for Caffeine.io**
   - Visit [join.caffeine.ai](https://join.caffeine.ai)
   - Sign up for alpha/beta access
   - Wait for approval (usually 24-48 hours)

3. **Deploy via Caffeine.io**
   - Log in to your Caffeine.io dashboard
   - Click "New Project"
   - Select "Import from GitHub"
   - Choose your Tuzla Guide repository
   - Select "React + Motoko" template
   - Click "Deploy"

4. **Configure Your App**
   - Add environment variables in Caffeine.io dashboard
   - Set up your Mapbox token
   - Configure payment API keys
   - Set custom domain (optional)

5. **Verify Deployment**
   - Visit your app URL: `https://your-app.id.icp.coffee`
   - Test all functionality
   - Check offline capabilities

### Caffeine.io Configuration

#### Environment Variables
Add these to your Caffeine.io project settings:

```env
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_NOWPAYMENTS_API_KEY=your_api_key
REACT_APP_NOWPAYMENTS_IPN_SECRET=your_secret
NODE_ENV=production
```

#### Custom Domain (Optional)
1. Go to project settings
2. Add custom domain
3. Configure DNS records
4. Wait for SSL certificate

## 🔧 Manual DFX Deployment

### Prerequisites
- DFINITY SDK (dfx) installed
- ICP wallet with cycles
- Node.js 16+

### Local Deployment

1. **Start Local Replica**
   ```bash
   dfx start --background --clean
   ```

2. **Create Canisters**
   ```bash
   dfx canister create --all
   ```

3. **Build and Deploy**
   ```bash
   npm run setup  # Install deps and deploy
   # OR manually:
   dfx deploy --network local
   ```

4. **Access Your App**
   - Frontend: Check `dfx deploy` output for URL
   - Backend: Use `dfx canister id backend`

### Mainnet Deployment

1. **Get Cycles**
   ```bash
   # Check balance
   dfx wallet balance
   
   # Get cycles if needed
   dfx wallet top-up --amount 10
   ```

2. **Deploy to Mainnet**
   ```bash
   dfx deploy --network ic
   ```

3. **Verify Deployment**
   ```bash
   # Get canister IDs
   dfx canister id backend --network ic
   dfx canister id frontend --network ic
   ```

## 🐳 Docker Deployment

### Development

1. **Build Docker Image**
   ```bash
   docker build -t tuzla-guide .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env tuzla-guide
   ```

### Production with Docker Compose

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access Your App**
   - Frontend: http://localhost
   - SSL: https://localhost (if configured)

## 🔐 Security Configuration

### Content Security Policy
Update the CSP in `index.html` based on your services:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://icp-api.io https://api.mapbox.com;
  media-src 'self';
  object-src 'none';
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### API Keys Security
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Use different keys for different environments

## 📊 Monitoring & Analytics

### ICP Metrics
- Canister cycles usage
- Query/update call statistics
- Memory usage
- Response times

### Frontend Analytics
- Page load times
- User interactions
- Error tracking
- Performance metrics

### Setup Monitoring
1. **ICP Dashboard**: Use ICP's built-in monitoring
2. **Custom Metrics**: Add your own analytics
3. **Error Tracking**: Implement error boundaries
4. **Performance**: Use Web Vitals

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check dfx version
dfx --version

# Update dfx
dfx upgrade

# Clear cache
dfx cache delete
```

#### 2. Cycles Insufficient
```bash
# Check wallet balance
dfx wallet balance

# Add more cycles
dfx wallet top-up --amount 10
```

#### 3. Build Errors
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
```

#### 4. Service Worker Issues
```bash
# Clear browser cache
# Unregister service worker
# Check console for errors
```

### Debug Commands

```bash
# Check canister status
dfx canister status backend
dfx canister status frontend

# View logs
dfx canister logs backend
dfx canister logs frontend

# Check cycles balance
dfx wallet balance

# Inspect canister
dfx canister info backend
dfx canister info frontend
```

## 🔄 Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to ICP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Install DFX
        run: |
          curl -fsSL https://internetcomputer.org/install.sh | sh
          echo "$HOME/bin" >> $GITHUB_PATH
          
      - name: Deploy to ICP
        run: |
          dfx deploy --network ic
        env:
          DFX_IDENTITY: ${{ secrets.DFX_IDENTITY }}
```

### Environment Secrets
Add these to your GitHub repository secrets:
- `DFX_IDENTITY`: Your ICP identity file
- `MAPBOX_TOKEN`: Mapbox API token
- `NOWPAYMENTS_API_KEY`: Payment API key

## 📈 Scaling

### Performance Optimization
1. **Asset Optimization**
   - Compress images and audio
   - Use WebP format
   - Lazy loading

2. **Caching Strategy**
   - Service worker caching
   - CDN integration
   - Browser caching headers

3. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

### Horizontal Scaling
1. **Multiple Canisters**
   - Split by functionality
   - Load balancing
   - Geographic distribution

2. **CDN Integration**
   - Static asset CDN
   - Dynamic content caching
   - Edge computing

## 🛠️ Maintenance

### Regular Tasks
1. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Cycles**
   ```bash
   dfx wallet balance
   ```

3. **Review Logs**
   ```bash
   dfx canister logs backend
   ```

4. **Update Content**
   - Refresh attraction data
   - Update audio guides
   - Add new features

### Backup Strategy
1. **Code Backup**: Git repository
2. **Data Backup**: Export canister data
3. **Configuration**: Environment variables
4. **Assets**: Media files backup

## 📞 Support

If you encounter issues:

1. **Check Documentation**: This guide and README
2. **GitHub Issues**: Report bugs on GitHub
3. **DFINITY Forum**: Ask ICP-specific questions
4. **Discord**: Join our community server

### Getting Help
- Provide clear error messages
- Include steps to reproduce
- Share environment details
- Attach logs if possible

---

Happy deploying! 🚀