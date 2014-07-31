using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;

public class DbGateway
{
    private static MySqlConnection connectionMYSQL;
    private static SqlConnection connectionSQL;
    private static bool useSQL = Configuration.USESQL; //set to TRUE to use sql as the database

    //Constructor
    public DbGateway()
    {
        Initialize();
    }

    //Initialize values
    public static void Initialize()
    {
        //MUST CONFIGURE THESE (in config class_)
        string server = Configuration.DB_SERVER;
        string database = Configuration.DB_NAME;
        string uid = Configuration.DB_USERID;
        string password = Configuration.DB_PASSWORD;

        string connectionString; //this helped with connecting to remote db old auth http://stackoverflow.com/questions/20962578/mysql-using-old-auth-method/20975708
        connectionString = "Server=" + server + ";" + "Database=" + database + ";" + "Uid=" + uid + ";" + "Pwd=" + password + ";";
        
        if(useSQL)
            connectionSQL = new SqlConnection(connectionString);
        else
            connectionMYSQL = new MySqlConnection(connectionString);
    }

    //open connection to database
    private static bool OpenConnection()
    {
        try
        {
            if (useSQL)
                connectionSQL.Open();
            else
                connectionMYSQL.Open();
            return true;
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    //Close connection
    private static bool CloseConnection()
    {
        try
        {
            if (useSQL)
                connectionSQL.Close();
            else
                connectionMYSQL.Close();
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    //Select statement
    public static List<string>[] Select()
    {
        string query = "SELECT * FROM points ORDER BY pointId;";

        //Create a list to store the result
        List<string>[] list = new List<string>[7];
        list[0] = new List<string>();
        list[1] = new List<string>();
        list[2] = new List<string>();
        list[3] = new List<string>();
        list[4] = new List<string>();
        list[5] = new List<string>();
        list[6] = new List<string>();

        //Open connection
        if (OpenConnection())
        {
            if (useSQL)
            {
                //Create Command
                SqlCommand cmd = new SqlCommand(query, connectionSQL);

                //Create a data reader and Execute the command
                SqlDataReader dataReader = cmd.ExecuteReader();

                if (dataReader.Read())
                {
                    //Read the data and store them in the list
                    do
                    {
                        list[0].Add(dataReader["pointId"] + "");
                        list[1].Add(dataReader["status"] + "");
                        list[2].Add(dataReader["latitude"] + "");
                        list[3].Add(dataReader["longitude"] + "");
                        list[4].Add(dataReader["heading"] + "");
                        list[5].Add(dataReader["description"] + "");
                        list[6].Add(dataReader["attribution"] + "");
                    } while (dataReader.Read());
                }
                else
                {
                    // Nothing was returned, do something
                }

                //close Data Reader
                dataReader.Close();
            }
            else
            {
                //Create Command
                MySqlCommand cmd = new MySqlCommand(query, connectionMYSQL);
                
                //Create a data reader and Execute the command
                MySqlDataReader dataReader = cmd.ExecuteReader();
                
                if (dataReader.Read())
                {
                    //Read the data and store them in the list
                    do
                    {
                        list[0].Add(dataReader["pointId"] + "");
                        list[1].Add(dataReader["status"] + "");
                        list[2].Add(dataReader["latitude"] + "");
                        list[3].Add(dataReader["longitude"] + "");
                        list[4].Add(dataReader["heading"] + "");
                        list[5].Add(dataReader["description"] + "");
                        list[6].Add(dataReader["attribution"] + "");
                    } while (dataReader.Read());
                }
                else
                {
                    // Nothing was returned, do something
                }

                //close Data Reader
                dataReader.Close();
            }
            

            //close Connection
            CloseConnection();

            //return list to be displayed
            return list;
        }
        else
        {
            return list;
        }

    }

    //Count statement
    public static int Count()
    {
        string query = "SELECT Count(*) FROM points";
        int Count = -1;

        //open connection
        if (OpenConnection())
        {
            //create command and assign the query and connection from the constructor
            if (useSQL)
            {
                SqlCommand cmd = new SqlCommand(query, connectionSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }
            else
            {
                MySqlCommand cmd = new MySqlCommand(query, connectionMYSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }

            //close connection
            CloseConnection();

            return Count;
        }
        else
        {
            return Count;
        }
    }

    //Insert statement
    public static void Insert(string param1, string param2, string param3, string param4, string param5, string param6, string param7)
    {
        
        //open connection
        if (OpenConnection())
        {
            //create command and assign the query and connection from the constructor
            if (useSQL)
            {
                //string query = "INSERT INTO points (pointId, status, latitude, longitude, heading, description, attribution)" +
                //    " VALUES(" + Convert.ToInt32(param1) + "," + Convert.ToInt32(param2) + "," + Convert.ToDecimal(param3)
                //    + "," + Convert.ToDecimal(param4) + ",'" + param5 + "','" + param6 + "','" + param7 + "');";

                string query = "INSERT INTO points (pointId, status, latitude, longitude, heading, description, attribution)" +
                    " VALUES('" + Convert.ToInt32(param1) + "','" + Convert.ToInt32(param2) + "','" + Convert.ToDecimal(param3)
                    + "','" + Convert.ToDecimal(param4) + "','" + param5 + "','" + param6 + "','" + param7 + "');";

                SqlCommand cmd = new SqlCommand(query, connectionSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }
            else
            {
                string query = "INSERT INTO points (pointId, status, latitude, longitude, heading, description, attribution) VALUES(" + Convert.ToInt32(param1) + ",'"
                + Convert.ToInt32(param2) + "'," + Convert.ToDouble(param3) + "," + Convert.ToDouble(param4) + ",'" + param5 + "','" + param6 + "','" + param7 + "');";
                
                MySqlCommand cmd = new MySqlCommand(query, connectionMYSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }

            //close connection
            CloseConnection();
        }
    }

    //update statement
    public static void Update(string param1, string param2, string param3, string param4, string param5, string param6, string param7)
    {

        //open connection
        if (OpenConnection())
        {
            //create command and assign the query and connection from the constructor
            if (useSQL)
            {
                string query = "UPDATE points " +
                    "SET status=" + Convert.ToInt32(param2) + ", latitude=" + Convert.ToDecimal(param3)
                    + ", longitude=" + Convert.ToDecimal(param4) + ", heading='" + param5 + "', description='" + param6
                    + "', attribution='" + param7
                    + "' WHERE pointId=" + Convert.ToInt32(param1) + ";";
                SqlCommand cmd = new SqlCommand(query, connectionSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }
            else
            {
                string query = "UPDATE points " +
                    "SET status=" + Convert.ToInt32(param2) + ", latitude=" + Convert.ToDouble(param3)
                    + ", longitude=" + Convert.ToDouble(param4) + ", heading='" + param5 + "', description='" + param6
                    + "', attribution='" + param7
                    + "' WHERE pointId=" + Convert.ToInt32(param1) + ";";
                MySqlCommand cmd = new MySqlCommand(query, connectionMYSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }

            //close connection
            CloseConnection();
        }
    }

    //delete statement
    public static void Delete(string param1)
    {
        string query = "DELETE FROM points WHERE pointId=" + Convert.ToInt32(param1) + ";";

        //open connection
        if (OpenConnection())
        {
            //create command and assign the query and connection from the constructor
            if (useSQL)
            {
                SqlCommand cmd = new SqlCommand(query, connectionSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }
            else
            {
                MySqlCommand cmd = new MySqlCommand(query, connectionMYSQL);
                //Execute command
                cmd.ExecuteNonQuery();
            }

            //close connection
            CloseConnection();
        }
    }

}