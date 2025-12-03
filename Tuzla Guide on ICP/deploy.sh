#!/bin/bash

# Tuzla Guide Deployment Script for Internet Computer
# This script handles local development deployment and mainnet deployment

set -e

echo "🚀 Tuzla Guide Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if dfx is installed
check_dfx() {
    if ! command -v dfx &> /dev/null; then
        print_error "dfx is not installed. Please install it first:"
        echo "  curl -fsSL https://internetcomputer.org/install.sh | sh"
        exit 1
    fi
    print_success "dfx is installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Start local ICP replica
start_replica() {
    print_status "Starting local ICP replica..."
    
    # Check if replica is already running
    if dfx start --background --clean 2>/dev/null; then
        print_success "Local replica started"
    else
        print_warning "Replica might already be running or failed to start"
    fi
    
    # Wait a moment for replica to be ready
    sleep 3
}

# Deploy to local network
deploy_local() {
    print_status "Deploying to local network..."
    
    # Create canisters
    dfx canister create --all
    
    # Build and deploy
    dfx deploy --network local
    
    print_success "Deployed to local network"
    
    # Show canister IDs
    echo ""
    print_status "Canister IDs:"
    dfx canister id backend
    dfx canister id frontend
}

# Deploy to mainnet
deploy_mainnet() {
    print_status "Deploying to Internet Computer mainnet..."
    
    # Check if we have enough cycles
    print_warning "Make sure you have enough cycles in your wallet"
    
    # Deploy to mainnet
    dfx deploy --network ic
    
    print_success "Deployed to Internet Computer mainnet"
    
    # Show mainnet URLs
    echo ""
    print_status "Mainnet URLs:"
    dfx canister id backend --network ic
    dfx canister id frontend --network ic
}

# Generate type declarations
generate_types() {
    print_status "Generating type declarations..."
    
    dfx generate backend
    
    print_success "Type declarations generated"
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    
    # Start backend and frontend in parallel
    npm run dev &
    
    print_success "Development server started"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:8000"
}

# Stop local replica
stop_replica() {
    print_status "Stopping local replica..."
    
    dfx stop
    
    print_success "Local replica stopped"
}

# Show usage
show_usage() {
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Initial setup and dependency installation"
    echo "  local     - Deploy to local network"
    echo "  mainnet   - Deploy to Internet Computer mainnet"
    echo "  dev       - Start development server"
    echo "  stop      - Stop local replica"
    echo "  generate  - Generate type declarations"
    echo "  help      - Show this help message"
    echo ""
}

# Main execution
main() {
    case "${1:-help}" in
        setup)
            check_node
            install_dependencies
            check_dfx
            generate_types
            print_success "Setup complete!"
            ;;
        local)
            check_dfx
            start_replica
            generate_types
            deploy_local
            print_success "Local deployment complete!"
            ;;
        mainnet)
            check_dfx
            generate_types
            deploy_mainnet
            print_success "Mainnet deployment complete!"
            ;;
        dev)
            check_dfx
            start_replica
            generate_types
            start_dev
            ;;
        stop)
            stop_replica
            ;;
        generate)
            check_dfx
            generate_types
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"