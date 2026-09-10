---
pubDatetime: 2023-08-01T20:08:21Z
modDatetime: 2023-08-01T20:15:13Z
title: "Extracting Formatted Content from MediaWiki"
tags:
  - "Linux"
  - "python"
  - "Web"
heroImage: "/blog-media/2020/07/mediawiki_logo.png"
description: "When extracting content from MediaWiki to transfer into SharePoint - or other knowledgebase system, extracting the raw `wikitext` isn't that helpful. I tra"
---
When extracting content from MediaWiki to transfer into SharePoint - or other knowledgebase system, extracting the raw \`wikitext\` isn't that helpful. I trawled around looking for tools that parse \`wikitext\` and always came back to using the PHP code that MediaWiki itself uses. For this reason, I chose not to extract and process it outside of MediaWiki, but use calls to MediaWiki to give me HTML code.

To extract formatted HTML code, you need to call the MediaWiki API.

Below is the script I came up with. It visits the “Main_Page” and spiders that for links to retrieve other pages. Then to make a more complete extract I fetch the categories, and spidered all pages on those categories.

I had to identify images, and then choose to download the full size images, rather than thumbnails. I did this using beautiful soup, and parsed the `img` tag `src` attributes, replacing, and stripping until I got the path to the full size image. Then stored the images in the same path structure so that the extracted HTML still relatively referenced them correctly.

### Authentication[](https://smartlimited.sharepoint.com/sites/SmartIT-Midlands/SitePages/Extracting-Formatted-Content-from.aspx#authentication)

To get the details required for authentication, you need to visit ‘Special:BotPasswords’ and create a bot with password and necessary permissions to read from your site.

### wiki.py

```
#!/usr/bin/python3
​
import requests
from bs4 import BeautifulSoup
import os, shutil
import re
​
USERNAME = "username@botname"
PASSWORD = "secretapikey"
​
​
class MediaWiki:
    # Keep a record of what we've processed so we don't repeat it
    processed = []
    _session = None
    _baseurl = "https://wiki.domain.tld"
    _url = "%s/api.php" % _baseurl
    _token = None
​
    def __init__(self):
        self._session = requests.Session()
        self._token = self.get_token()
​
    def baseurl(self, baseurl):
        self._baseurl = baseurl
​
    def http_get(self, params):
        """Send a http get request
​
        Args:
            session (requests.Session): Session object
            params (mixed): http get parameters
​
        Returns:
            mixed: json response
        """
        response = self._session.get(url=self._url, params=params)
        return response.json()
​
    def http_post(self, params):
        """Send a http post request
​
        Args:
            session (requests.Session): Session object
            params (mixed): http get parameters
​
        Returns:
            mixed: json response
        """
        response = self._session.post(url=self._url, data=params)
        return response.json()
​
    def get_token(self):
        # Retrieve login token first
        params = {
            "action": "query",
            "meta": "tokens",
            "type": "login",
            "format": "json",
        }
        data = self.http_get(params)
​
        return data["query"]["tokens"]["logintoken"]
​
    def login(self, username, password):
        params = {
            "action": "login",
            "lgname": username,
            "lgpassword": password,
            "lgtoken": self._token,
            "format": "json",
        }
​
        data = self.http_post(params)
​
        assert data["login"]["result"] == "Success"
​
    def scan(self, page_name):
        """
        Send api calls to mediawiki to pull page_name in rendered html.
        This should contain only the content, no menu structure or any other blocks.
        """
        page_name = page_name.replace(" ", "_")
        if page_name not in self.processed and re.search("^File\:", page_name) is None:
            print(page_name)
​
            params = {
                "action": "query",
                "format": "json",
                "titles": page_name,
                "prop": "categories",
            }
            data = self.http_get(params)
            pages = data["query"]["pages"]
            categories = []
            for k, v in pages.items():
                if "categories" in v:
                    for category in v["categories"]:
                        categories.append("%s+" % category["title"])
                else:
                    categories.append("")
​
            params = {"action": "parse", "format": "json", "page": page_name}
            data = self.http_get(params)
​
            try:
                html = data["parse"]["text"]["*"]
​
                soup = BeautifulSoup(html, "html.parser")  # Create html soup obj
​
                images = soup.find_all("img")  # Find all images
​
                image_sources = []
​
                for image in images:  # Add image src to array
                    # If the image is a thumb get the full size image
                    if image["src"].find("/thumb") >= 0:
                        image["src"] = image["src"].replace("/thumb", "")
                        image["src"] = "/".join(image["src"].split("/")[:-1])
                    if image["src"][0] == "/":
                        image["src"] = image["src"][1:]
​
                    image_sources.append(image["src"])
​
                for image_src in image_sources:
                    """
                    iterate image src to download files into the same folder structure as the wiki
                    """
                    img_name = image_src.split("/")[-1]  # File name
                    os.makedirs(image_src[: -len(img_name)], exist_ok=True)
                    webs = self._session.get(
                        url="%s/%s" % (self._baseurl, image_src)
                    )  # Download the image
​
                    # Delete folder from wrongly downloaded thumbs
                    if os.path.isdir(image_src):
                        shutil.rmtree(image_src)
​
                    open(image_src, "wb").write(webs.content)  # Write the image
​
                self.processed.append(page_name)
​
                hrefs = soup.find_all("a", href=True)  # Find all <a href>
​
                for href in hrefs:
                    """
                    Iterate hrefs excluding special pages and non-wiki urls
                    """
                    if (
                        re.search("Special\:", href["href"]) is None
                        and re.search("^http", href["href"]) is None
                        and re.search("^\/wiki\/", href["href"]) is not None
                        and re.search("^\#", href["href"]) is None
                    ):
                        # Replace /wiki/ and and .html to URL's
                        if href["href"][:6] == "/wiki/":
                            href["href"] = "%s.html" % href["href"][6:]
​
                        child_page = href["href"].split(".")[0]
​
                        self.scan(child_page)  # Recursive scan
​
                    if re.search("^\#", href["href"]) is not None:
                        href["href"] = href["href"].lower().replace("_", "-")
​
                #  Delete the [edit] spans
                spans = soup.find_all("span", {"class": "mw-editsection"})
                for span in spans:
                    span.decompose()
​
                # Write this after we've processed the URL replacements
                with open(
                    "%s%s.html"
                    % (
                        categories[0].replace("Category:", "").replace(" ", ""),
                        page_name.replace("/", ""),
                    ),
                    "w",
                ) as f:  # Write html to file with the page name
                    f.write(str(soup.prettify()))
​
            except Exception as e:
                with open("errors.log", "a") as err:
                    err.write("%s %s\n" % (page_name, e))
​
    def categories(self):
        """Get list of mediawiki categories
​
        Returns:
            list: List of categories
        """
        params = {
            "action": "query",
            "format": "json",
            "acfrom": "0",
            "aclimit": 500,
            "list": "allcategories",
        }
​
        data = self.http_get(params)
​
        categories = data["query"]["allcategories"]
​
        retval = []
        for category in categories:
            retval.append(category["*"])
​
        return retval
​
​
mw = MediaWiki()
​
mw.login(USERNAME, PASSWORD)
​
mw.scan("Main_Page")
​
categories = mw.categories()
​
# Get pages from category
for category in categories:
    # scan("Category:%s" % category)
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": "Category:%s" % category,
        "cmlimit": 500,
        "cmtype": "page",
    }
​
    data = mw.http_get(params)
​
    # print(category, data)
​
    for member in data["query"]["categorymembers"]:
        mw.scan(member["title"])
```
