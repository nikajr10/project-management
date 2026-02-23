using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string message, IFormFile? attachment = null);
}