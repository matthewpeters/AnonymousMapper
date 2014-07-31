using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Web;
using MailMessage = System.Net.Mail.MailMessage;

public partial class _Default : System.Web.UI.Page
{
    public string pageHTML; //holds all of the html that represents the page
    public List<string>[] points = new List<string>[7];
    public static int incomingPointsCount;

    //handles on page load
    protected void Page_Load(object sender, EventArgs e)
    {
        //init db
        DbGateway.Initialize();

        //get incoming points
        getIncomingPoints();

        //get client to server vars
        string action = HttpContext.Current.Request.Form["action"] ?? String.Empty;
        string payload = HttpContext.Current.Request.Form["payload"] ?? String.Empty;
        
        //determine if there were hidden requests
        if (!String.IsNullOrEmpty(action))
        {
            if (action == "save")
                SaveContent(payload);
        }

        //create the html page
        constructPageHTML();

    }

    //creates and sends an email message
    private static void sendNotify()
    {
        if (Configuration.USEMAILER)
        {
            try
            {
                SmtpClient mySmtpClient = new SmtpClient(Configuration.EMAIL_SERVER, Configuration.EMAIL_PORT);
                if (Configuration.EMAIL_PORT == 465)
                    mySmtpClient.EnableSsl = true; //change port above to 465

                // set smtp-client with basicAuthentication
                mySmtpClient.UseDefaultCredentials = false;
                System.Net.NetworkCredential basicAuthenticationInfo = new System.Net.NetworkCredential(Configuration.EMAIL_USERNAME, Configuration.EMAIL_PASSWORD);
                mySmtpClient.Credentials = basicAuthenticationInfo;

                // add from,to mailaddresses
                MailAddress from = new MailAddress(Configuration.EMAIL_SENDER, "NOTIFY");
                MailAddress to = new MailAddress(Configuration.EMAIL_RECIPIENT, "NOTIFY");
                MailMessage myMail = new System.Net.Mail.MailMessage(from, to);

                // add ReplyTo
                MailAddress replyto = new MailAddress(Configuration.EMAIL_SENDER);
                myMail.ReplyTo = replyto;

                // set subject and encoding
                myMail.Subject = "NOFITICATION: New Note Needs Moderation";
                myMail.SubjectEncoding = System.Text.Encoding.UTF8;

                // set body-message and encoding
                myMail.Body = "There is a new Note needing moderation.";
                myMail.BodyEncoding = System.Text.Encoding.UTF8;
                // text or html
                myMail.IsBodyHtml = true;

                mySmtpClient.Send(myMail);
            }

            catch (SmtpException ex)
            {
                throw new ApplicationException
                  ("SmtpException has occured: " + ex.Message);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        

    }

    //parse and save incoming message
    public static void SaveContent(String sendData)
    {
        //get rid of excess string
        sendData = sendData.Replace("{\"sendData\": \"", "").Replace("{\"sendData\":\"", "");

        //validate
        if (sendData.Length == 0)
            return;

        //save into db
        //
        //get the length of incoming message
        int index1 = sendData.LastIndexOf("~", StringComparison.Ordinal);

        //split into each save message
        string[] allSaves = sendData.Substring(0, index1).Split('~');

        //hold save type handle
        string saveTypeHandle = null;
        //go through each item to save
        for (int i = 0; i < allSaves.Length; i++)
        {
            //get the length of save message
            int index = allSaves[i].LastIndexOf("|");
            //split into save elements
            string[] ar = allSaves[i].Substring(0, index).Split('|');
            //determine the save type handle (position 0 in array)
            saveTypeHandle = ar[0];
            //handle the save type
            switch (saveTypeHandle)
            {
                case "save":
                    //do nothing, not used
                    break;
                case "update":
                    DbGateway.Update(ar[2], ar[3], ar[4], ar[5], ar[6].Replace("'", "&apos;").Replace("\"", "&quot;"), ar[7].Replace("'", "&apos;").Replace("\"", "&quot;"), ar[8].Replace("'", "&apos;").Replace("\"", "&quot;"));
                    break;
                case "create":
                    DbGateway.Insert(ar[2], ar[3], ar[4], ar[5], ar[6].Replace("'", "&apos;").Replace("\"", "&quot;"), ar[7].Replace("'", "&apos;").Replace("\"", "&quot;"), ar[8].Replace("'", "&apos;").Replace("\"", "&quot;"));
                    sendNotify();
                    break;
                case "delete":
                    //took out for security
                    break;
            }
        }
    }

    //get incoming
    private void getIncomingPoints()
    {
        List<string>[] list = DbGateway.Select(); 
        points[0] = new List<string>(); //pointId
        points[1] = new List<string>(); //isActive
        points[2] = new List<string>(); //lat
        points[3] = new List<string>(); //lng
        points[4] = new List<string>(); //head
        points[5] = new List<string>(); //desc
        points[6] = new List<string>(); //attr

        incomingPointsCount = list[0].Count();

        for (int i = 0; i < incomingPointsCount; i++)
        {
            points[0].Add(list[0][i]);
            points[1].Add(list[1][i]);
            points[2].Add(list[2][i]);
            points[3].Add(list[3][i]);
            points[4].Add(list[4][i]);
            points[5].Add(list[5][i]);
            points[6].Add(list[6][i]);
        }

    }

    //This creates the page structure
    public void constructPageHTML()
    {
        //create the string builder
        StringBuilder stringBuilder = new StringBuilder();

        //begin page content
        stringBuilder.AppendLine(" <html> ");
        stringBuilder.AppendLine("  ");

        //begin html header content
        stringBuilder.AppendLine(" <head> ");
        stringBuilder.AppendLine("  ");

        //custom css files
        stringBuilder.AppendLine(" <link rel=\"stylesheet\" type=\"text/css\" href=\"inc/css/custom_main.css\"> ");

        //standard js files
        stringBuilder.AppendLine(" <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=drawing\"></script> ");
        stringBuilder.AppendLine(" <script type=\"text/javascript\" src=\"inc/js/jquery_1.11.0.min.js\"></script> ");

        //custom js files
        stringBuilder.AppendLine(" <script type=\"text/javascript\" src=\"inc/js/custom_main.js\"></script> ");
        stringBuilder.AppendLine(" ");

        //begin custom js
        stringBuilder.AppendLine(" <script type=\"text/javascript\"> ");
        stringBuilder.AppendLine(" ");

        //setup server to client vars writer
        stringBuilder.AppendLine(" // Add Server Vars ");
        stringBuilder.AppendLine(" function initServerToClientVars(){ ");
        stringBuilder.AppendLine("  ");
        stringBuilder.AppendLine(" } ");
        stringBuilder.AppendLine("  ");

        //objects writer section
        stringBuilder.AppendLine(" // Add Objects ");
        stringBuilder.AppendLine(" function initObjects(){ ");
        
        ////get all points
        //List<string>[] point = getIncomingPoints();

        stringBuilder.AppendLine("  locations = [");
        for (int i = 0; i < incomingPointsCount; i++)
        {
            if (i == (incomingPointsCount - 1))
            {
                stringBuilder.AppendLine("    [ " + points[0][i] + ", " + points[1][i].ToLower() + ", " + points[2][i] + ", " + points[3][i] + ", '" + points[4][i].Replace("&para;", "<br/>") + "', '" + points[5][i].Replace("&para;", "<br/>") + "', '"+points[6][i].TrimEnd('\r', '\n')+"' ] ");
            }
            else
            {
                stringBuilder.AppendLine("    [ " + points[0][i] + ", " + points[1][i].ToLower() + ", " + points[2][i] + ", " + points[3][i] + ", '" + points[4][i].Replace("&para;", "<br/>") + "', '" + points[5][i].Replace("&para;", "<br/>") + "', '" + points[6][i].TrimEnd('\r', '\n') + "' ], ");
            }
        }
        stringBuilder.AppendLine("  ]; ");

        //close geo objects writer section
        stringBuilder.AppendLine(" }");
        stringBuilder.AppendLine(" ");
        
        //end custom js
        stringBuilder.AppendLine(" </script> ");
        stringBuilder.AppendLine(" ");
        
        //add the page title
        stringBuilder.AppendLine(" <title>Human Pyramid</title>  ");
        stringBuilder.AppendLine("  ");

        //end html header content
        stringBuilder.AppendLine(" </head> ");
        stringBuilder.AppendLine("  ");

        //begin html body content 
        stringBuilder.AppendLine(" <body onload=\"initialize();\" onresize=\"resizeView();\"> ");
        stringBuilder.AppendLine("  ");

        //calback holders
        stringBuilder.AppendLine(" <form> ");
        stringBuilder.AppendLine("    <input type=\"hidden\" id=\"action\" name=\"action\" value=\"\" /> ");
        stringBuilder.AppendLine("    <input type=\"hidden\" id=\"payload\" name=\"payload\" value=\"\" /> ");
        stringBuilder.AppendLine(" </form> ");
        stringBuilder.AppendLine("  ");

        //message container
        stringBuilder.AppendLine(" <div id=\"container_message\"> ");
        stringBuilder.AppendLine("    <div id=\"content_message\"></div> ");
        stringBuilder.AppendLine(" </div> ");
        stringBuilder.AppendLine(" ");

        //html body page literal (translated)
        //to create this literal use: https://github.com/matthewpeters/html2csharp
        #region html page literal

        stringBuilder.AppendLine(" <div id=\"container_main\" class=\"shadow-leftRight\"> ");
        stringBuilder.AppendLine("      <div id=\"container_header\"> ");
        stringBuilder.AppendLine("          <div id=\"container_banner\"></div> ");
        stringBuilder.AppendLine("          <div id=\"container_menubar\"></div> ");
        stringBuilder.AppendLine("      </div> ");
        stringBuilder.AppendLine("      <div id=\"container_body\"> ");
        stringBuilder.AppendLine("          <div id=\"container_description\"> ");
        stringBuilder.AppendLine("              <p>DESCRIPTION: Menneske Pyramide [Human Pyramid], by Harald Rudyard Engman, Denmark Copenhagen, 1941</p> ");
        stringBuilder.AppendLine("              <p>INSTRUCTIONS: Click on the markers to see user-contributed annotations, double-click, use the scroll-wheel, or the on-screen controls to zoom; click-and-drag to pan. You can also add your own annotation.</p>  ");
        stringBuilder.AppendLine("          </div> ");
        stringBuilder.AppendLine("          <div id=\"container_controls\"> ");
        stringBuilder.AppendLine("              <a id=\"toggleDesc\">[Show/Hide Instructions]</a> ");
        stringBuilder.AppendLine("              <a id=\"toggleAnn\">[Show/Hide Notes]</a> ");
        stringBuilder.AppendLine("              <a id=\"togglePlacer\">[Place A Note]</a> ");
        stringBuilder.AppendLine("          </div> ");
        stringBuilder.AppendLine("          <div id=\"container_map\"></div>  ");
        stringBuilder.AppendLine("      </div> ");
        stringBuilder.AppendLine("      <div id=\"container_footer\"></div>  ");
        stringBuilder.AppendLine(" </div> ");
        
        #endregion

        //end html body content
        stringBuilder.AppendLine("  ");
        stringBuilder.AppendLine(" </body> ");
        stringBuilder.AppendLine("  ");

        //end page content
        stringBuilder.AppendLine(" </html> ");

        //write page html to var
        pageHTML = stringBuilder.ToString();
    }
    
}