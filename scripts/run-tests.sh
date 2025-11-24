#!/bin/bash

##############################################################################
# KryptoTrac Test Runner Script
# 
# This script helps run automated tests and provides a guided testing workflow.
# Usage: ./scripts/run-tests.sh [option]
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emoji
CHECK_MARK="✅"
CROSS_MARK="❌"
WARNING="⚠️"
INFO="ℹ️"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}${CHECK_MARK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS_MARK} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

##############################################################################
# Check Prerequisites
##############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local all_good=true
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js."
        all_good=false
    fi
    
    # Check npm or pnpm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    elif command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        print_success "pnpm installed: $PNPM_VERSION"
    else
        print_error "Neither npm nor pnpm found. Please install a package manager."
        all_good=false
    fi
    
    # Check for .env.local
    if [ -f ".env.local" ]; then
        print_success ".env.local file exists"
    else
        print_warning ".env.local not found. Copy .env.example to .env.local and fill in values."
        print_info "Run: cp .env.example .env.local"
        all_good=false
    fi
    
    # Check for node_modules
    if [ -d "node_modules" ]; then
        print_success "Dependencies installed"
    else
        print_warning "node_modules not found. Installing dependencies..."
        npm install || pnpm install
    fi
    
    # Check for Stripe CLI (optional)
    if command -v stripe &> /dev/null; then
        print_success "Stripe CLI installed (for webhook testing)"
    else
        print_warning "Stripe CLI not found (optional for webhook testing)"
        print_info "Install from: https://stripe.com/docs/stripe-cli"
    fi
    
    if [ "$all_good" = false ]; then
        echo ""
        print_error "Some prerequisites are missing. Please fix them before running tests."
        exit 1
    fi
    
    echo ""
    print_success "All prerequisites satisfied!"
}

##############################################################################
# Environment Validation
##############################################################################

check_environment() {
    print_header "Validating Environment Variables"
    
    local missing_vars=()
    
    # Source .env.local if it exists
    if [ -f ".env.local" ]; then
        set -a
        source .env.local
        set +a
    fi
    
    # Check required variables
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        else
            print_success "$var is set"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo ""
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_info "Edit .env.local and add the missing variables"
        exit 1
    fi
    
    # Check if using test mode for Stripe
    if [[ "$STRIPE_SECRET_KEY" == sk_test_* ]]; then
        print_success "Using Stripe test mode ✓"
    elif [[ "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
        print_error "WARNING: Using Stripe LIVE mode! Switch to test mode for testing!"
        exit 1
    else
        print_warning "Stripe key format not recognized"
    fi
    
    echo ""
    print_success "Environment variables validated!"
}

##############################################################################
# Test Functions
##############################################################################

run_auth_tests() {
    print_header "Running Authentication Tests"
    npm run test:login
}

run_payment_tests() {
    print_header "Running Payment Tests"
    npm run test:stripe
}

run_all_tests() {
    print_header "Running All Tests"
    npm run test:all
}

run_e2e_tests() {
    print_header "Running E2E Tests"
    npm run test:e2e
}

run_integration_tests() {
    print_header "Running Integration Tests"
    npm run test:integration
}

##############################################################################
# Webhook Testing Helper
##############################################################################

test_webhooks() {
    print_header "Stripe Webhook Testing"
    
    echo "This will start the Stripe CLI to forward webhooks to your local server."
    echo ""
    
    if ! command -v stripe &> /dev/null; then
        print_error "Stripe CLI not installed"
        print_info "Install from: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
    
    print_info "Starting webhook forwarding..."
    print_info "Make sure your dev server is running (npm run dev)"
    echo ""
    
    echo "Press Ctrl+C to stop webhook forwarding"
    echo ""
    
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
}

trigger_test_events() {
    print_header "Triggering Test Webhook Events"
    
    if ! command -v stripe &> /dev/null; then
        print_error "Stripe CLI not installed"
        exit 1
    fi
    
    print_info "Triggering test events..."
    echo ""
    
    echo "1. checkout.session.completed"
    stripe trigger checkout.session.completed
    sleep 2
    
    echo ""
    echo "2. customer.subscription.updated"
    stripe trigger customer.subscription.updated
    sleep 2
    
    echo ""
    echo "3. customer.subscription.deleted"
    stripe trigger customer.subscription.deleted
    sleep 2
    
    echo ""
    print_success "Test events triggered!"
    print_info "Check your application logs and database to verify processing"
}

##############################################################################
# Interactive Menu
##############################################################################

show_menu() {
    clear
    print_header "KryptoTrac Test Runner"
    
    echo "Select an option:"
    echo ""
    echo "  1) Run Authentication Tests (Login, Signup, etc.)"
    echo "  2) Run Payment Tests (Stripe Checkout, Webhooks)"
    echo "  3) Run All Tests with Coverage"
    echo "  4) Run E2E Tests Only"
    echo "  5) Run Integration Tests Only"
    echo "  6) Start Webhook Testing (Stripe CLI)"
    echo "  7) Trigger Test Webhook Events"
    echo "  8) Check Prerequisites"
    echo "  9) Validate Environment Variables"
    echo "  10) Open Manual Verification Guide"
    echo "  q) Quit"
    echo ""
}

open_manual_guide() {
    if [ -f "MANUAL_VERIFICATION_GUIDE.md" ]; then
        print_info "Opening manual verification guide..."
        if command -v open &> /dev/null; then
            open MANUAL_VERIFICATION_GUIDE.md  # macOS
        elif command -v xdg-open &> /dev/null; then
            xdg-open MANUAL_VERIFICATION_GUIDE.md  # Linux
        else
            print_info "Please open MANUAL_VERIFICATION_GUIDE.md manually"
        fi
    else
        print_error "MANUAL_VERIFICATION_GUIDE.md not found"
    fi
}

##############################################################################
# Main Menu Loop
##############################################################################

interactive_mode() {
    while true; do
        show_menu
        read -p "Enter your choice: " choice
        
        case $choice in
            1)
                run_auth_tests
                read -p "Press Enter to continue..."
                ;;
            2)
                run_payment_tests
                read -p "Press Enter to continue..."
                ;;
            3)
                run_all_tests
                read -p "Press Enter to continue..."
                ;;
            4)
                run_e2e_tests
                read -p "Press Enter to continue..."
                ;;
            5)
                run_integration_tests
                read -p "Press Enter to continue..."
                ;;
            6)
                test_webhooks
                read -p "Press Enter to continue..."
                ;;
            7)
                trigger_test_events
                read -p "Press Enter to continue..."
                ;;
            8)
                check_prerequisites
                read -p "Press Enter to continue..."
                ;;
            9)
                check_environment
                read -p "Press Enter to continue..."
                ;;
            10)
                open_manual_guide
                read -p "Press Enter to continue..."
                ;;
            q|Q)
                echo ""
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                sleep 2
                ;;
        esac
    done
}

##############################################################################
# Command Line Arguments
##############################################################################

case "${1:-}" in
    --auth|-a)
        check_prerequisites
        check_environment
        run_auth_tests
        ;;
    --payment|-p)
        check_prerequisites
        check_environment
        run_payment_tests
        ;;
    --all|-A)
        check_prerequisites
        check_environment
        run_all_tests
        ;;
    --e2e|-e)
        check_prerequisites
        check_environment
        run_e2e_tests
        ;;
    --integration|-i)
        check_prerequisites
        check_environment
        run_integration_tests
        ;;
    --webhook|-w)
        check_prerequisites
        check_environment
        test_webhooks
        ;;
    --trigger|-t)
        check_prerequisites
        trigger_test_events
        ;;
    --check|-c)
        check_prerequisites
        check_environment
        ;;
    --help|-h)
        echo "KryptoTrac Test Runner"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  -a, --auth           Run authentication tests"
        echo "  -p, --payment        Run payment tests"
        echo "  -A, --all            Run all tests with coverage"
        echo "  -e, --e2e            Run E2E tests only"
        echo "  -i, --integration    Run integration tests only"
        echo "  -w, --webhook        Start webhook testing with Stripe CLI"
        echo "  -t, --trigger        Trigger test webhook events"
        echo "  -c, --check          Check prerequisites and environment"
        echo "  -h, --help           Show this help message"
        echo ""
        echo "No option: Start interactive menu"
        ;;
    *)
        # No arguments - start interactive mode
        check_prerequisites
        check_environment
        interactive_mode
        ;;
esac
