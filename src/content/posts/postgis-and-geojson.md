---
pubDatetime: 2019-02-22T20:40:28Z
modDatetime: 2019-02-25T13:33:52Z
title: "PostGIS and geoJson"
tags:
  - "postgis"
  - "postgresql"
  - "Web"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "On with this current theme of spacial systems and mapping, one of the interesting challenges I faced was querying spacial data. My particular problem was t"
---
On with this current theme of spacial systems and mapping, one of the interesting challenges I faced was querying spacial data.

My particular problem was trying not to publish masses of polygons up onto an Esri map layer and make the data layer too cumbersome for our intended visitors purpose.

We have a lot of plots of land that we care for and needed to check that when a web site visitor clicks on the Esri map that we check to see if the location they have clicked actually belongs to a plot we manage.

I could have filled the map layer with polygons and used some logic to iterate the layers polygons, or find nearest polygon and determine if the clicked point was contained in the polygon. Instead I opted for taking the point they clicked on and submitting an XMLHttpRequest/Ajax query to an API which queries the polygon database.

The database contains a number of tables and the one I was after is held on one of our PostGIS systems. So now all I have to do is pass in a latitude and longitude and select from the table where the geometry contains the point I'm interested in.

## Spacial and Geographic SQL

As PostGIS is a PostgreSQL system with spacial extensions, the geometry data of the plots of land are held in a `geometry` column. To access the geometry features in the column you need to use PostGIS spacial functions.

In pseudo SQL the query I need is pretty much:

```
select * from table where geometry contains point;
```

### Grid Referencing Systems

In our environment I have learned that we store GIS data, not in latitude and longitude, but in eastings and northings. I had to take a crash course on GIS from our GIS team and they explained that there are many grid reference systems used for mapping - lat, long is only one of them.

The grid referencing system latitude and longitude is known as the World Geodetic System 1984 (WGS84) or EPSG:4326. The eastings and northings we use are OSGB 1936 / British Natianal Grid or UK Ordinance Survey references known as EPSG:27700.

> This section is hugely important in a wide range of functions I'm calling from the database. If you get the SRID wrong you don't get an error - your polygon or point just ends up in outer space somewhere. So don't be like me and exhaustively examine your code to see why polygons don't appear. Check that you are calling and referencing them in the same spacial reference!

So before I can make a query I have to use a common referencing system. I need to convert my EPSG 4326 point to EPSG 27700 so I can query the EPSG 27700 data in the geometry of the table.

It sounds complicated, but is really straight forward using a couple of PostGIS functions.

Create a point from longitude and latitude specifying it as EPSG 4326:

```
ST_setsrid(ST_point(longitude, latitude)), 4326)
```

*SRID = Spacial Referencing ID*

Now transform that point to EPSG 27700:

```
ST_transform(ST_setsrid(ST_point(longitude, latitude)), 4326), 27700)
```

I can now query my table where the geometry column contains a polygon that contains my point.

```
select * from table where
  ST_contains(geometry,
    ST_transform(ST_setsrid(ST_point(longitude, latitude)), 4326), 27700)
  );
```

Then I get back any rows that have details of my plots of land.

At this point I can offer a response to my quest to find out if my point is in my database of true or false based on it returning any rows. But let's take it a step further. Instead of returning a boolean, yes or no, let's reply with the coordinates of the polygon as well. That way I can plot the polygon on the map.

## geoJson

Sending data back out from my API should be consumable by more than just my Esri map. Why not make it a standards based response so it could be called and consumed by others.

[GeoJson](http://geojson.org/) ([RFC 7946](https://tools.ietf.org/html/rfc7946)) is a standardised way to presenting spacial data to a JavaScript call. It is in essence a structured Json ([JavaScript Object Notation](https://json.org/)) response.

Formatting my response as geoJson I'm able to reply to my API call with a HTTP status code of [404 - not found](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_errors), when my point isn't in the table and HTTP status code [200 - success](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success) and include the geoJson data of the found row and polygon.

The important function here is the [`ST_AsGeoJson`](http://www.postgis.net/docs/ST_AsGeoJSON.html)`(geometry)` call to convert the geometry column to geoJson:

```
SELECT jsonb_build_object(
   'type',     'FeatureCollection',
   'features', jsonb_agg(feature)
 )
 FROM (
   SELECT jsonb_build_object(
     'type',       'Feature',
     'id',         gid,
     'geometry',   ST_AsGeoJSON(geometry)::jsonb,
     'properties', to_jsonb(inputs) - 'title' - 'description'
   ) AS feature
   FROM (
     SELECT * FROM table
   ) inputs
 ) features;
```

This results in my SQL response already being geoJson for me to pass out from my API to the client.

```
{ "type": "FeatureCollection",
    "features": [
    {
      "type": "Feature",
      "geometry": {
      "type": "Polygon",
      "coordinates": [
           [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
             [100.0, 1.0], [100.0, 0.0] ]
           ]
      },
      "properties": {
        "title": "Got the plot",
        "description": "My mystery polygon"
      }
    }
  ]
}
```

I can then pick this up in my JavaScript client and take the polygon and draw it where the user clicked the map.

## Other Considerations

You might consider modifying the SQL to suit eg. limit the response to only one row or include only columns you need. You might also want to return more than one polygon and include those nearest to the point using other PostGIS functions for nearest/closest point etc.

## References

PostGIS Documentation: <http://www.postgis.net/documentation/>
