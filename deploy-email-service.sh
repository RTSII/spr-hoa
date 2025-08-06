#!/bin/bash

# SPR-HOA Email Service Deployment Script
# This script automates the deployment of the email notification system

set -e  # Exit on any error

echo "🚀 SPR-HOA Email Service Deployment"
echo "======================================"

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

# Check if required commands exist
check_requirements() {
    print_status "Checking requirements..."

    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        print_error "curl not found. Please install curl."
        exit 1
    fi

    print_success "All requirements met"
}

# Check if user is logged in to Supabase
check_supabase_auth() {
    print_status "Checking Supabase authentication..."

    if ! supabase projects list &> /dev/null; then
        print_error "Not logged in to Supabase. Please run:"
        echo "supabase login"
        exit 1
    fi

    print_success "Supabase authentication verified"
}

# Get project reference
get_project_ref() {
    if [ -z "$PROJECT_REF" ]; then
        echo -n "Enter your Supabase project reference ID: "
        read PROJECT_REF
    fi

    if [ -z "$PROJECT_REF" ]; then
        print_error "Project reference is required"
        exit 1
    fi

    print_status "Using project reference: $PROJECT_REF"
}

# Get Resend API key
get_resend_key() {
    if [ -z "$RESEND_API_KEY" ]; then
        echo -n "Enter your Resend API key (starts with re_): "
        read -s RESEND_API_KEY
        echo
    fi

    if [ -z "$RESEND_API_KEY" ]; then
        print_error "Resend API key is required"
        exit 1
    fi

    if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
        print_warning "API key doesn't start with 're_'. Please verify it's correct."
        echo -n "Continue anyway? (y/N): "
        read confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_success "Resend API key configured"
}

# Link project
link_project() {
    print_status "Linking to Supabase project..."

    if supabase link --project-ref "$PROJECT_REF"; then
        print_success "Project linked successfully"
    else
        print_error "Failed to link project. Please check your project reference."
        exit 1
    fi
}

# Set environment variables
set_environment() {
    print_status "Setting environment variables..."

    if supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"; then
        print_success "Environment variables set"
    else
        print_error "Failed to set environment variables"
        exit 1
    fi
}

# Deploy Edge Function
deploy_function() {
    print_status "Deploying send-email Edge Function..."

    if [ ! -d "supabase/functions/send-email" ]; then
        print_error "Edge Function directory not found. Please ensure you're in the project root."
        exit 1
    fi

    if supabase functions deploy send-email; then
        print_success "Edge Function deployed successfully"
    else
        print_error "Failed to deploy Edge Function"
        exit 1
    fi
}

# Update database
update_database() {
    print_status "Updating database configuration..."

    # Check if SQL file exists
    if [ ! -f "sql/send_photo_rejection_email_updated.sql" ]; then
        print_error "Updated SQL file not found: sql/send_photo_rejection_email_updated.sql"
        exit 1
    fi

    print_warning "Please execute the following SQL in your Supabase SQL Editor:"
    echo "----------------------------------------"
    echo "-- 1. Set project URL"
    echo "SELECT set_config('app.supabase_url', 'https://$PROJECT_REF.supabase.co', false);"
    echo ""
    echo "-- 2. Enable http extension"
    echo "CREATE EXTENSION IF NOT EXISTS http;"
    echo ""
    echo "-- 3. Execute the updated SQL file:"
    echo "-- Copy and paste the contents of sql/send_photo_rejection_email_updated.sql"
    echo "----------------------------------------"
    echo ""
    echo -n "Press Enter when you've completed the database updates..."
    read
}

# Test the setup
test_setup() {
    print_status "Testing the email service..."

    echo -n "Enter an email address to send a test email to: "
    read TEST_EMAIL

    if [ -z "$TEST_EMAIL" ]; then
        print_warning "No test email provided, skipping test"
        return
    fi

    print_status "Sending test email to $TEST_EMAIL..."

    # Test the Edge Function directly
    FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/send-email"

    # Get anon key (you'll need to provide this)
    echo -n "Enter your Supabase anon key: "
    read -s ANON_KEY
    echo

    if curl -X POST "$FUNCTION_URL" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"to\": \"$TEST_EMAIL\",
            \"subject\": \"SPR-HOA Email Service Test\",
            \"html\": \"<h1>Success!</h1><p>Your SPR-HOA email service is working correctly.</p>\"
        }" \
        --silent --show-error; then
        echo
        print_success "Test email sent! Check $TEST_EMAIL inbox (including spam folder)"
    else
        echo
        print_error "Test email failed. Check the function logs:"
        echo "supabase functions logs send-email"
    fi
}

# Main deployment process
main() {
    echo "This script will deploy the SPR-HOA email notification service."
    echo "Make sure you have:"
    echo "1. A Resend account with API key"
    echo "2. Supabase CLI installed and logged in"
    echo "3. Access to your Supabase project"
    echo ""
    echo -n "Continue? (y/N): "
    read confirm

    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi

    check_requirements
    check_supabase_auth
    get_project_ref
    get_resend_key
    link_project
    set_environment
    deploy_function
    update_database
    test_setup

    echo ""
    print_success "🎉 Email service deployment completed!"
    echo ""
    echo "Next steps:"
    echo "1. Test photo rejection workflow in the admin panel"
    echo "2. Monitor email logs in admin_logs table"
    echo "3. Check Resend dashboard for delivery statistics"
    echo ""
    echo "Useful commands:"
    echo "- View function logs: supabase functions logs send-email"
    echo "- View email logs: Check admin_logs table in Supabase"
    echo "- Test database function: SELECT test_email_function('test@example.com');"
}

# Run the main function
main "$@"
