---
pubDatetime: 2016-11-11T19:52:25Z
modDatetime: 2016-11-13T16:22:20Z
title: "DMARC, SPF and DKIM"
tags:
  - "dkim"
  - "dmarc"
  - "email"
  - "Laravel"
  - "php"
  - "smtp"
  - "spf"
  - "Web"
heroImage: "/blog-media/2016/11/capture.png"
description: "For several ears now we've run a fairly tight ship on our email server. It consumes an awful lot of resources mainly because of how many businesses out the"
---
For several ears now we've run a fairly tight ship on our email server. It consumes an awful lot of resources mainly because of how many businesses out there fail to properly configure their email server correctly. By far the biggest failing is not using the proper HELO/EHLO name and not having a reverse DNS (RNDS/PTR) record that matches. So please, if you're an email admin, get it sorted. This is an internet standard from way back in the 1980's and beyond! Adding to our anti-spam systems using DKIM and SPF we've brought in DMARC to enforce compliance with these standards. So in future we'll be telling recipients to reject mail claiming to be from our domain that fails to meet the SPF and DKIM checks.

## So what's all this about?

[**SPF**](http://www.openspf.org/) - Sender Policy Framework allows recipients of mail to check that the sending server is authorised to send mail on behalf of the domain. [**DKIM**](http://www.dkim.org/) - Adds a digital signature into the header of each email that can be independently verified as being sent from the domain. [**DMARC**](https://dmarc.org/) - Tells recipients what to do if the mail they just received fails the SPF and DKIM checks. All of these are achieved using DNS entries. So a spammer is highly unlikely to be able to manipulate your DNS records to pretend to send email from your domain. The DMARC DNS record also tells the recipient where to send email reports that detail where sending systems claim to be from our domain. After setting up our DMARC DNS record I've been getting reports in from various sources. The primary ones so far seem to be AOL, Microsoft, Google and Yahoo. But Also seeing reports from Rolls Royce. What's interesting is that we've obviously failed to keep up with SPF changes. Some senders that send on our behalf are sending from addresses we know nothing about. But it's also interesting to see just how many other senders are out there claiming to send from our domain. Right now our DMARC setting is report only, so when we change it to reject spammers will start seeing mail being bounced as they can no longer satisfy the recipients requirements to validate the sender. The DMARC aggregate reports that come in have an XML attachment that once extracted can be added to a system to be reported on. As part of the system I've developed I've made up of an existing Open Source [GitHub](https://github.com/) project - [solaris/php-dmarc](https://github.com/solarissmoke/php-dmarc). I added this into a Laravel project and scheduled it to download the email attachments using IMAP, extract the xml files and then read the xml files into a MySQL database. Then we can browse the records as a table on a web page. PHP IMAP library: [https://github.com/ddeboer/imap](https://github.com/ddeboer/imap)

## Laravel Project

Within Laravel I created a couple of commands. One to download the messages from an IMAP server and another to process those downloaded files and add them into the database. The key parts of the PHP files are here.

### dmarc:poll-imap

``` php

    public function handle()
    {
        $server = new Server(config('dmarc.imap_server'));
        $cn = $server->authenticate(config('dmarc.imap_user'), config('dmarc.imap_password'));
        $mailbox = $cn->getMailBox('INBOX');
        
        if (!file_exists(config('dmarc.dir')))
            mkdir(config('dmarc.dir'), 0777, true);

        $messages = $mailbox->getMessages();
        foreach ($messages as $message)
        {
            $attachments = $message->getAttachments();
            foreach ($attachments as $attachment)
            {
                $file = sprintf('%s/%s', config('dmarc.dir'), $attachment->getFilename());
                if (!file_exists($file))
                    $this->info(sprintf('Written: %s', $file));
                    file_put_contents($file, $attachment->getDecodedContent());
            }
            $message->delete();
        }
        $mailbox->expunge();
    }
```

This polls the IMAP server using settings from `config/dmarc.php` for mail messages and then downloads the attachments from them into the `dmarc.dir` folder. Which I conveniently located under the Laravel `storage` folder as this has permissions that the web service user can already write into.

### dmarc:process-files

``` php

    public function handle()
    {
        $parser = new \Solaris\DmarcAggregateParser(env('DB_HOST'), env('DB_USERNAME'), env('DB_PASSWORD'), env('DB_DATABASE'));
        
        if ($h = opendir(config('dmarc.dir')))
        {
            while (false !== ($entry = readdir($h)))
            {
                if (strlen(pathinfo($entry, PATHINFO_EXTENSION)) > 0 && strpos('.zip.gz', pathinfo($entry, PATHINFO_EXTENSION)) > 0)
                {
                    $this->info(sprintf("Processing %s", $entry));
                    $parser->parse(sprintf('%s/%s', config('dmarc.dir'), $entry));
                }                
            }
        }
        
        $rptrecords = DmarcRptRecord::select('ip')
            ->whereNotIn('ip', DNS::select('ip')
                         ->distinct()
                         ->get())
            ->get();

        foreach ($rptrecords as $rptrecord)
        {
            $host = gethostbyaddr($rptrecord->ip);
            $this->info(sprintf("%s\t%s", $rptrecord->ip, $host));
            $dns = DNS::updateOrCreate([
                'ip' => $rptrecord->ip,
                'name' => $host
            ]);            
        }
    }
```

This command takes the downloaded files and passes them to the Dmarc parser. After the files are parsed I added a section to select all of the IP addresses from the databases and use `gethostbyaddr` to get the name of the host and store that in my own DNS lookup cache table. So when it comes to reading the DMARC reports I have both the IP of the sending host and the name, so it's much easier to understand.

## The Laravel View

The only Laravel view I'm using right now is `dmarc/index.blade.php` to show the data in a DataTables JQuery plugin from a json data query.

### dmarc/index.blade.php

![capture](/blog-media/2016/11/capture.png)

- HTML Content \* [dmarc-index-blade](/blog-media/2016/11/dmarc-index-blade.odt "dmarc-index-blade") (Wordpress seems to screw up posting this HTML so it's attached in an .odt file)

Which gets it's data from a controller that returns json in a manner which the DataTables plugin handles.

### DataController@getDmarc (data/getdmarc)

Could do with some work to tidy up and validate request data.

``` php

    public function getDmarc(Request $request) {        
        
        $search = '';
        if ($request->has('search') && $request->input('search')['value'] !== '')
            $search = sprintf('%%%%%s%%%%', $request->input('search')['value']);
        
        $draw = 0;
        if ($request->has('draw'))
            $draw = intval($request->input('draw'));

        $start = 0;
        if ($request->has('start'))        
            $start = intval($request->input('start'));
        
        $take = 10;
        if ($request->has('length'))        
            $take = intval($request->input('length'));        
        
        $dir = 'desc';
        if ($request->has('order'))
            $dir = ($request->input('order')[0]['dir'] == 'asc') ? 'asc' : 'desc';        

        $recordsObj = DB::table('report')
            ->join('rptrecord', 'report.serial', 'rptrecord.serial')
            ->join('dns', 'rptrecord.ip', 'dns.ip')
            ->orderBy('date_begin', $dir)
            ->select('*');

        $recordsTotal = $recordsFiltered = \App\DmarcRptRecord::count();
        
        if ($request->has('columns')) {
            if ($request->input('columns')[5]['search']['value'] == 'fail' && $request->input('columns')[6]['search']['value'] == 'fail') {
                $recordsObj->where(function ($query) {
                    $query->where('rptrecord.dkim_result', '=', 'fail')
                        ->orWhere('rptrecord.spf_result', '=', 'fail');
                });
            }
            elseif ($request->input('columns')[5]['search']['value'] == 'fail')
            {
                $recordsObj->where('rptrecord.dkim_result', '=', 'fail');
            }
            elseif ($request->input('columns')[6]['search']['value'] == 'fail')
            {
                $recordsObj->where('rptrecord.spf_result', '=', 'fail');
            }            
        }
        
        if ($search !== '')
        {
            $recordsObj = $recordsObj->where(function($query) use ($search) {
                $query->where('report.org', 'like', $search)
                    ->orWhere('dns.name', 'like', $search);
            });
        }
        
        $recordsFiltered = $recordsObj->count();
            
        $records = $recordsObj
            ->take($take)
            ->skip($start)
            ->get();
        
        $dmarc = [];
            foreach ($records as $record)
            {
                $dmarc[] = [$record->date_begin, $record->org, $record->report_id, $record->count, $record->disposition, $record->dkim_result, $record->spf_result, $record->ip, $record->name];
            }
        
        return response(['draw' => $draw, 'recordsTotal' => $recordsTotal, 'recordsFiltered' => $recordsFiltered, 'data' => $dmarc])
            ->header('Content-type', 'text/json; charset=utf-8');        
    }
```

### Database Tables

Used a migration to create the database tables that are required by the solaris/php-dmarc project.

``` php

<?php
    use Illuminate\Support\Facades\Schema;
    use Illuminate\Database\Schema\Blueprint; 
    use Illuminate\Database\Migrations\Migration;
    class CreateDmarcTables extends Migration {
     /**
      * Run the migrations.
      *
      * @return void
      */
     public function up()     {
         Schema::create('report', function (Blueprint $table) {
            $table->increments('serial');
            $table->datetime('date_begin');
            $table->datetime('date_end');
            $table->string('domain');
            $table->string('org');
            $table->string('report_id');
            $table->timestamps();
            $table->unique(['domain', 'report_id']);            
        });
        
        Schema::create('rptrecord', function(Blueprint $table) {
            $table->increments('id');
            $table->integer('serial');
            $table->string('ip');
            $table->unsignedInteger('count');
            $table->string('disposition');
            $table->string('reason')->nullable();
            $table->enum('dkim_result', ['none','pass','fail','neutral','policy','temperror','permerror']);
            $table->enum('spf_result', ['none','neutral','pass','fail','softfail','temperror','permerror']);
            $table->timestamps();
            $table->index(['serial', 'ip']);
        });
        
        Schema::create('rptresult', function(Blueprint $table) {
            $table->increments('id');
            $table->integer('serial');
            $table->string('ip');
            $table->enum('type', ['dkim', 'spf']);
            $table->unsignedInteger('seq');
            $table->string('domain');
            $table->enum('result', ['none','pass','fail','softfail','neutral','policy','temperror','permerror']);
            $table->timestamps();
            $table->index(['serial','ip','type','seq']);
        });
        
        Schema::create('dns', function(Blueprint $table) {
            $table->increments('id');
            $table->string('ip');
            $table->string('name');
            $table->timestamps();
            $table->index(['ip','name']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('report');
        Schema::drop('rptrecord');
        Schema::drop('rptresult');
        Schema::drop('dns');
    }
}
```
