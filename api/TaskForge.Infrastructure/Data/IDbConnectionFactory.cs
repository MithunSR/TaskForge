using System.Data;

namespace TaskForge.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}