terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "sistema-pago-catalogo"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "dev"
}

# S3 Bucket for CSV files
resource "aws_s3_bucket" "catalog_bucket" {
  bucket = "${var.project_name}-${var.environment}-catalog-csv"
  
  tags = {
    Name        = "${var.project_name}-catalog-bucket"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "catalog_bucket_versioning" {
  bucket = aws_s3_bucket.catalog_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "catalog_bucket_encryption" {
  bucket = aws_s3_bucket.catalog_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "catalog_bucket_pab" {
  bucket = aws_s3_bucket.catalog_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# KMS key for encryption
resource "aws_kms_key" "catalog_kms" {
  description             = "KMS key for catalog encryption"
  deletion_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-kms-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "catalog_kms_alias" {
  name          = "alias/${var.project_name}-catalog"
  target_key_id = aws_kms_key.catalog_kms.key_id
}

# SSM Parameters for Redis configuration
resource "aws_ssm_parameter" "redis_host" {
  name  = "/catalogo/redis/host"
  type  = "String"
  value = "redis-cluster-endpoint"  # This should be updated with actual Redis endpoint

  tags = {
    Name        = "${var.project_name}-redis-host"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "redis_port" {
  name  = "/catalogo/redis/port"
  type  = "String"
  value = "6379"

  tags = {
    Name        = "${var.project_name}-redis-port"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "redis_password" {
  name  = "/catalogo/redis/password"
  type  = "SecureString"
  value = "redis-password-placeholder"  # This should be updated with actual Redis password

  tags = {
    Name        = "${var.project_name}-redis-password"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "kms_key" {
  name  = "/catalogo/kms/key"
  type  = "String"
  value = aws_kms_key.catalog_kms.arn

  tags = {
    Name        = "${var.project_name}-kms-key"
    Environment = var.environment
  }
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-lambda-role"
    Environment = var.environment
  }
}

# IAM Policy for Lambda functions
resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.project_name}-lambda-policy"
  description = "Policy for catalog Lambda functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.catalog_bucket.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.catalog_kms.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          aws_ssm_parameter.redis_host.arn,
          aws_ssm_parameter.redis_port.arn,
          aws_ssm_parameter.redis_password.arn,
          aws_ssm_parameter.kms_key.arn
        ]
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for catalog files"
  value       = aws_s3_bucket.catalog_bucket.id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.catalog_kms.arn
}

output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_role.arn
}
