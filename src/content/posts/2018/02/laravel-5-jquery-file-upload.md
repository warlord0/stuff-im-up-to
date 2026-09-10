---
pubDatetime: 2018-02-22T19:16:51Z
modDatetime: 2018-02-26T09:58:14Z
title: "Laravel 5 - jQuery File Upload"
tags:
  - "ajax"
  - "Bootstrap"
  - "JavaScript"
  - "Laravel"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/jquery_logo.png"
description: "I needed a mechanism to upload CSV files to my Laravel instance and then process them into a table. The first part was working out how I wanted to upload t"
---
I needed a mechanism to upload CSV files to my Laravel instance and then process them into a table. The first part was working out how I wanted to upload the files. I came across [`blueimp-file-upload`](https://blueimp.github.io/jQuery-File-Upload/) which seems pretty popular and capable. There was no need to go overly fancy. Just a simple form will do as the file will probably be uploaded as a single file. First I had to figure out how to get blueimp into Laravel. It's a component that only features on one page so no need to install and compile it into my `app.js`. So I opted to let `composer` handle the repository and webpack mix to handle delivery to the project.

    $ composer require blueimp/jquery-file-upload

With it in my vendor folder I amended `webpack.mix.js` to copy it (not compile it) into my `public/js` structure. Now I amended my `webpack.mix.js` to copy (no compile) the components into my `public/js` structure.

    mix.js('resources/assets/js/app.js', 'public/js')

      ...

      .copy('vendor/blueimp/jquery-file-upload/js/jquery.fileupload.js', 'public/js')
      .copy('vendor/blueimp/jquery-file-upload/js/jquery.iframe-transport.js', 'public/js')
      .copy('vendor/blueimp/jquery-file-upload/js/vendor/jquery.ui.widget.js', 'public/js/vendor')
      .sass('resources/assets/sass/app.scss', 'public/css')
      .version();

I then built a blade to output the form and embed the jQuery addon parts. Because I use the `kris/laravel-form-builder` it's easier to show the HTML output from the blade than the blade and form code. https://gist.github.com/warlord0/e9231c01c4ede213a6d837fce43702c0 I wrote the Javascript inline in this instance to show it all together. This handles the file upload using Ajax and has progress and returns failures. Success or failure is fed back to the user using `bootstrap-notify`. The form is very basic. You can click the button to choose files, or just drag and drop them onto the page. The `blueimp` uploader is very slick. ![Capture](/blog-media/2018/02/capture.png)The server side php receiver part I kept simple. Validate the mime type so it must be a text or CSV file, store the upload in `storage/app/public` and respond with a blueimp compatible json response.

        /**
          Process an uploaded file and return a blueimp json respnse
          */
        public function upload(Request $request) {
          $validated = $request->validate([
            'file' => 'mimes:txt,csv'
          ]);

          $file = $request->file('file')
            ->store('public');

          ProcessUploads::dispatch($file);

          $response = ['files' => [[
            'name' => $request->file('file')->getClientOriginalName(),
            'size' => $request->file('file')->getClientSize()
            ]]
          ];

          return $response;
        }

In this case I'm offloading the uploaded file to be processed by a Laravel Job Queue (`App\Job\ProcessUploads`) as the CSV processing is likely to be more than the client timeout can handle. I thought this would only allow me to drag and drop single files. But it works just as well with many. Using the job queue it creates a job for each file too.

## Other Considerations

In order to allow files to be uploaded you need to set or check the allowed limits of your web server and php. For Nginx you need to set the value in your `nginx.conf` for `client_max_body_size` in the `http` section eg.

    client_max_body_size 300M;

For PHP you'll need to set two values in `php.ini`

    upload_max_filesize = 300M

    post_max_size = 300M

If you don't set these you'll get an Nginx 413 error or a server 500 error.
