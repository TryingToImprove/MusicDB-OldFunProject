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
XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("../Xml/Playlists.xml"));

        if (!String.IsNullOrEmpty(Request.QueryString["Mode"]) && (Request.QueryString["Mode"] == "GetAll"))
        {
            string xpathExpr = "/playlists/playlist";
            int counter  = 0;

            XmlNodeList nodeList = doc.SelectNodes(xpathExpr);

            if (nodeList.Count > 0)
            {
                Response.Write("["); //array start

                foreach (XmlNode node in nodeList)
                {
                    Response.Write("{ \"id\": \"" + node.ChildNodes[0].InnerText.Trim() + "\"," +
                                    "\"title\": \"" + node.ChildNodes[1].InnerText.Trim() + "\" }");

                    counter++;

                    if (counter < nodeList.Count)
                    {
                        Response.Write(",");
                    }

                }

                Response.Write("]"); //arrary slut
            }
            return;
        }
        
        
        string id = String.IsNullOrEmpty(Request.QueryString["ID"]) ? GetNextNodeID(doc).ToString() : Request.QueryString["ID"];
        XmlNode new_playlist = null;

        if (String.IsNullOrEmpty(Request.QueryString["ID"]))
        {
            new_playlist = CreatePlaylist(doc, id, Request.QueryString["Title"]);
        }
        else
        {
            string xpathExpr = "/playlists/playlist[id='" + id + "']"; 
            new_playlist = doc.SelectSingleNode(xpathExpr);
        }

        if (!String.IsNullOrWhiteSpace(Request.QueryString["items"]))
        {
            foreach (string item in Request.QueryString["items"].Split(Convert.ToChar(",")))
            {
                XmlNode song = AddToPlaylist(doc, new_playlist, item);
                if (song != null)
                {
                    new_playlist.ChildNodes[2].AppendChild(song);
                }
            }
        }

        doc.DocumentElement.AppendChild(new_playlist);

        doc.Save(Server.MapPath("../Xml/Playlists.xml"));
    }

    private int GetNextNodeID(XmlDocument doc)
    {
        XmlNodeList nodes = doc.SelectNodes("//playlists/playlist");

        int nNodeID = nodes.Count;
        nNodeID++;

        return nNodeID;
    }
    
    private XmlNode AddToPlaylist(XmlDocument doc, XmlNode new_playlist, string __id)
    {
        if (ValidateSong(doc, new_playlist.ChildNodes[0].Value, __id))
        {
            XmlNode new_song = doc.CreateElement("song"); //Container

            XmlNode id = doc.CreateElement("id");
            id.AppendChild(doc.CreateTextNode(__id));

            new_song.AppendChild(id);

            return new_song;
        }
        else
        {
            return null;
        }
    }

    private bool ValidateSong(XmlDocument doc, string __playlistId, string __id)
    {
        string expression = "//playlists/playlist[(id = \"" + __playlistId + "\")]/songs/song[(id = \"" + __id + "\")]";

        if (doc.SelectNodes(expression).Count > 0)
            return false;
        else
            return true;

    }

    private XmlNode CreatePlaylist(XmlDocument doc, string __id, string __title)
    {

        XmlNode new_song = doc.CreateElement("playlist"); //Container

        XmlNode id = doc.CreateElement("id");
        id.AppendChild(doc.CreateTextNode(__id));

        XmlNode title = doc.CreateElement("title");
        title.AppendChild(doc.CreateTextNode(__title));

        XmlNode songs = doc.CreateElement("songs");

        new_song.AppendChild(id);
        new_song.AppendChild(title);
        new_song.AppendChild(songs);

        return new_song;
    }
}