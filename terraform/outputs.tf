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

output "ssm_parameter_redis_host" {
  description = "SSM parameter for Redis host"
  value       = aws_ssm_parameter.redis_host.name
}

output "ssm_parameter_redis_port" {
  description = "SSM parameter for Redis port"
  value       = aws_ssm_parameter.redis_port.name
}

output "ssm_parameter_redis_password" {
  description = "SSM parameter for Redis password"
  value       = aws_ssm_parameter.redis_password.name
}
