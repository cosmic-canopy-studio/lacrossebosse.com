output "api_endpoint" {
  value = "${aws_apigatewayv2_api.form.api_endpoint}/submit"
}

output "ses_verification_token" {
  value = aws_ses_domain_identity.main.verification_token
}
