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

        XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("../Xml/Data.xml"));

        if (id != "0")
        {
            xpathExpr = "/songs/song[id='" + id + "']";
            XmlNode node_id = doc.SelectSingleNode(xpathExpr);
            if (node_id != null)
            {
                Response.Write("{ \"id\": \"" + node_id.ChildNodes[0].InnerText.Trim() + "\"," +
                    "\"title\": \"" + node_id.ChildNodes[1].InnerText.Trim() + "\" }");
            }
        }
    }

}