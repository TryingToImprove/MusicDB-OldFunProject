using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string id = Request.QueryString["id"], xpathExpr;
        int counter = 0;

        XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("../Xml/Playlists.xml"));

        if (id != "0")
        {
            xpathExpr = "/playlists/playlist[id='" + id + "']";
            XmlNode node_id = doc.SelectSingleNode(xpathExpr);


            Response.Write("{ \"id\": \"" + node_id.ChildNodes[0].InnerText.Trim() + "\", \"title\": \"" + node_id.ChildNodes[1].InnerText.Trim() + "\", \"songs\": ");

            Response.Write("[");
            foreach (XmlNode node in node_id.ChildNodes[2])
            {
                Response.Write("{ \"id\": \"" + node.ChildNodes[0].InnerText.Trim() + "\" }");

                counter++;
                if (counter < node_id.ChildNodes[2].ChildNodes.Count) Response.Write(", ");
            }
            Response.Write("] }");
        }
    }

}