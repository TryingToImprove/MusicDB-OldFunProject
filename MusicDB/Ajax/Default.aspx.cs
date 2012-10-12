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
        if ((Request.QueryString["id"] != null) && (Request.QueryString["title"] != null))
        {
            AddSong(Request.QueryString["id"], Request.QueryString["title"]);
            Response.Write("{ message : \"Completed\" }");
        }
        else
        {
            GetAllSongs();
        }

    }

    private void GetAllSongs()
    {
        string returnJSON = "[";

        XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("../Xml/Data.xml"));

        XmlNodeList nodeList = doc.GetElementsByTagName("song");
        int counter = 0;
        foreach (XmlNode song in nodeList)
        {
            string id = song.ChildNodes[0].FirstChild.Value,
                    title = song.ChildNodes[1].FirstChild.Value;


            returnJSON += "{ \"id\" : \"" + id + "\", \"title\" : \"" + title + "\" }";

            counter++;
            if (counter < nodeList.Count)
            {
                returnJSON += ",";
            }
        }

        returnJSON += "]";

        Response.Write(returnJSON);
    }

    private void AddSong(string __id, string __title)
    {
        XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("../Xml/Data.xml"));

        if (ValidateSong(doc, __id, __title))
        {

            XmlNode new_song = doc.CreateElement("song"); //Container

            XmlNode id = doc.CreateElement("id");
            id.AppendChild(doc.CreateTextNode(__id));

            XmlNode title = doc.CreateElement("title");
            title.AppendChild(doc.CreateTextNode(__title));

            new_song.AppendChild(id);
            new_song.AppendChild(title);

            doc.DocumentElement.AppendChild(new_song);

            doc.Save(Server.MapPath("../Xml/Data.xml"));
        }
    }

    private bool ValidateSong(XmlDocument doc, string __id, string __title)
    {
        string expression = "songs/song[(id = \"" + __id + "\") and (title = \"" + __title + "\")]";

        if (doc.SelectNodes(expression).Count > 0)
            return false;
        else
            return true;

    }
}