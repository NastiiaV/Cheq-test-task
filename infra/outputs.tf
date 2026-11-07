output "instance_public_ip" {
  description = "Open http://this-address after the first deploy."
  value       = aws_instance.app.public_ip
}

output "ecr_repository_url" {
  description = "GitHub Actions pushes the API image here."
  value       = aws_ecr_repository.api.repository_url
}
