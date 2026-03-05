#!/bin/bash

echo "=== Clavis API Token Management System Demo ==="
echo ""

echo "1. Creating test tokens..."
clavis create --key "api.github.production" --token "ghp_abc123def456" --tag "github" --comment "Production GitHub API"
clavis create --key "api.github.staging" --token "ghp_staging789" --tag "github" --expiration "2024-06-30" --comment "Staging environment"
clavis create --key "aws.production.s3" --token "AKIAIOSFODNN7EXAMPLE" --tag "aws" --comment "S3 access for production"
clavis create --key "aws.staging.ec2" --token "AKIAI44QH8DHBEXAMPLE" --tag "aws" --expiration "2024-12-31"
clavis create --key "database.postgres.prod" --token "postgres://user:pass@localhost/db" --tag "database"

echo ""
echo "2. Listing all tokens..."
clavis list

echo ""
echo "3. Searching tokens with 'github' pattern..."
clavis list --search "github"

echo ""
echo "4. Searching tokens with 'aws' pattern..."
clavis list --search "aws"

echo ""
echo "5. Filtering by tag 'database'..."
clavis list --tag "database"

echo ""
echo "6. Showing details of a specific token..."
clavis show "api.github.production"

echo ""
echo "7. Updating a token..."
clavis update "api.github.staging" --comment "Updated staging token with new scope"

echo ""
echo "8. Showing updated token..."
clavis show "api.github.staging"

echo ""
echo "9. Deleting a token..."
clavis delete "database.postgres.prod"

echo ""
echo "10. Final list of tokens..."
clavis list

echo ""
echo "=== Demo Complete ==="
echo "Note: Run 'clavis clear' to remove all test data"