---
pubDatetime: 2018-03-12T14:52:25Z
modDatetime: 2018-03-12T14:53:01Z
title: "PostGIS Import from PHP Session Fails"
tags:
  - "JavaScript"
  - "Laravel"
  - "postgis"
  - "postgresql"
  - "Web"
description: "Undefined function: 7 ERROR: function st_makepoint(numeric, numeric) does not exist"
---
When importing a CSV file using Laravel I found that I'd get some strange error messages relating to a called function not matching the parameters that I was sending.

    local.ERROR: SQLSTATE[42883]: Undefined function: 7 ERROR: function st_makepoint(numeric, numeric) does not exist
    LINE 1: SELECT ST_SetSRID(ST_MakePoint(NEW.x_coordinate, NEW.y_coord...
     ^
    HINT: No function matches the given name and argument types. You might need to add explicit type casts.

I narrowed it down to the `ST_SetSRID()` and `ST_MakePoint()` functions and was 100% sure that they existed in the database, and with the right parameter types. I tried casting the values to `double precision` and still and the same errors. The solution turned out to be that the function existed in the `public` schema NOT the schema I was using! This seems strange because my database parameters has `public` in the `search_path` parameter. What was strange is that when I used the same import file directly in pgadmin it ran the same insert trigger and worked just fine. It was only when I ran the import from the web server that the functions couldn't be found. But they are in the same trigger!? I then modified the trigger to specify the schema to use eg.

    public.ST_SetSRID(public.ST_MakePoint(NEW.x_coordinate, NEW.y_coord...

That is all! So the `search_path` only seems valid at the server and not within my PHP session.
