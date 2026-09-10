---
pubDatetime: 2019-05-16T09:19:08Z
title: "Linux and MS SQL ODBC Authentication"
tags:
  - "Laravel"
  - "Linux"
  - "mssql"
heroImage: "/blog-media/2016/10/mssql_logo.png"
description: "My recent troubles spawned from connecting my Laravel application to a Microsoft SQL Server database. My username and password are correct but the connecti"
---
My recent troubles spawned from connecting my Laravel application to a Microsoft SQL Server database. My username and password are correct but the connection fails.

In the `storage/logs/laravel.log` file I found the following:

```
[2019-05-16 08:22:46] work.ERROR: SQLSTATE[HY000]: [Microsoft][ODBC Driver 17 for SQL Server]SSPI Provider: No Kerberos credentials available (default cache: FILE:/tmp/krb5cc_1000) (SQL: select * from holidays where holiday_date > '2019-05-16 08:22:46') {"exception":"[object] (Illuminate\Database\QueryException(code: HY000): SQLSTATE[HY000]: [Microsoft][ODBC Driver 17 for SQL Server]SSPI Provider: No Kerberos credentials available (default cache: FILE:/tmp/krb5cc_1000) (SQL: select * from holidays where holiday_date > '2019-05-16 08:22:46') at /PATH/vendor/laravel/framework/src/Illuminate/Database/Connection.php:664, Doctrine\DBAL\Driver\PDOException(code: HY000): SQLSTATE[HY000]: [Microsoft][ODBC Driver 17 for SQL Server]SSPI Provider: No Kerberos credentials available (default cache: FILE:/tmp/krb5cc_1000) at /PATH/vendor/doctrine/dbal/lib/Doctrine/DBAL/Driver/PDOConnection.php:47, PDOException(code: HY000): SQLSTATE[HY000]: [Microsoft][ODBC Driver 17 for SQL Server]SSPI Provider: No Kerberos credentials available (default cache: FILE:/tmp/krb5cc_1000) at /PATH/vendor/doctrine/dbal/lib/Doctrine/DBAL/Driver/PDOConnection.php:43)
```

I haven't setup any Kerberos on my Linux side to authenticate and it would appear that my MS SQL wants me to use that. So instead of setting up Kerberos I opted for getting the ODBC connection NOT to use Kerberos.

To do this for my specific user account on my development system I created an `~/.odbc.ini` file and added details to disable Kerberos:

### .odbc.ini

```
[my_database]
 Driver = ODBC Driver 17 for SQL Server
 Server = myserver.domain.local,1433
 Database = my_database
# If NOT using Kerberos authentication:
 Trusted_Connection = No
 ServerSPN = MSSQLSvc/myserver.domain.local:my_database
# If using SSL encryption:
 Encryption = Yes
# If using SSL and not importing the server certificate into your certificate store:
 TrustServerCertificate = Yes
```

To ensure that Laravel makes use of this config the only way I could do it was to NOT use the eloquent models and had to use PHP PDO directly.

```
// We need to use a direct PDO here because of the
// Trusted Connection=No / SSPI required in .odbc.ini
$pdo = new \PDO('sqlsrv:Server='.env('DB_HOST'),
  env('DB_USER'), env('DB_PASSWORD'));

// Create the number of token parameters
$params = implode(',', array_fill(0, count($tokens), '?'));
$sql = "select data from my_table where something in ($params);";
$stmt = $pdo->prepare($sql);
$stmt->execute($tokens);

$rows = $stmt->fetchAll(\PDO::FETCH_ASSOC); // Associated Array only
```
