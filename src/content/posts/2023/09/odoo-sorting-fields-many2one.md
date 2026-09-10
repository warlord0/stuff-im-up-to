---
pubDatetime: 2023-09-05T23:13:00Z
modDatetime: 2023-09-06T10:22:34Z
title: "Odoo: Sorting fields.Many2one"
tags:
  - "odoo"
  - "python"
  - "Web"
heroImage: "/blog-media/2023/09/odoo_logo.png"
description: "Beginning a journey to develop an Odoo application, I came across a hurdle that I found no answer to. Odoo is an ERP product that is Open Source, and is hi"
---
Beginning a journey to develop an Odoo application, I came across a hurdle that I found no answer to.

> Odoo is an ERP product that is Open Source, and is highly configurable, and is a development framework based on Python.
>
> https://www.odoo.com

When you click a Many2one on a form view, the displayed items aren't ordered the way I'd like. They appear in the order of their underlying unique field ID, and I want them ordered by their name/display_name.

Initially, searching around, I found that I could override the `search()` function with my own and pass it a `context` parameter to dictate how the data gets sorted. This turned out not to be the case, and several hours later I discover it's actually calling the `name_search()` function, meaning I am overriding the wrong function.

I figured out that the data returned by the `name_search()` function was a tuple, and all I needed to do was sort it by the value, not the key.

Here's what I came up with.

Add a context attribute onto the form view.

```
<group>
  <field name="model" placeholder="Model of asset"
    context="{'order_display': 'asc' }" />
</group>
```

I'm using a simple string value of `asc` or `desc` to decide which direction to sort in.

In the model, create a new class that inherits from the current one, and override the `name_search()` function using the `@api.model` decorator.

```
class model(models.Model):
    _name = "cmdb.model"
    _description = "Model"

    name = fields.Char(required=True, help="Unique name of model")
    make = fields.Many2one("cmdb.make", string="Make",
                           help="Make of Model")


class CMDBModel(models.Model):
    """
    Override the cmdb.model to sort the values returned by fields.Many2one
    """
    _inherit = "cmdb.model"

    @api.model
    def name_search(self, name="", args=None, operator="ilike", limit=8):
        ctx = self._context

        order_display = 'asc'
        if 'order_display' in ctx:
            order_display = ctx['order_display']

        reverse = False
        if 'desc' in order_display.lower():
            reverse = True

        d = super(CMDBModel, self).name_search(
            name=name, args=args, operator=operator, limit=limit
        )
        res = sorted(d, key=lambda x: x[1], reverse=reverse)
        return res
```

You can see I have a model "`cmdb.model`", which I then create another class which uses `_inherit` to add the `@api.model` override to. This calls the `super` (parent function of the inherited model), grabs the tuple into `d` and passes it through `sorted()` using `reverse` to specify the order.
