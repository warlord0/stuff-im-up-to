---
pubDatetime: 2025-09-25T19:04:42+00:00
title: "Amazon KDP Cover Template for GIMP"
tags:
  - "Books"
  - "Amazon"
  - "Author"
  - "Gimp"
  - "Kdp"
  - "Publishing"
  - "Self Publish"
  - "Writing"
heroImage: "/blog-media/2018/10/hongkongphoeey.png"
description: "I got asked to publish some of my books as paperbacks on Amazon, they are all currently there for Kindle and ebook readers as ePub files. That means I needed to create covers that work with the actual book sizes. They need to take into account the paper thickness and number of pages in order…"
---
I got asked to publish some of my books as paperbacks on Amazon, they are all currently there for Kindle and ebook readers as ePub files. That means I needed to create covers that work with the actual book sizes. They need to take into account the paper thickness and number of pages in order to work out the spine size.

Amazon has a very useful tool ([KDP Cover Calculator](https://kdp.amazon.com/cover-calculator)) that works it out and gives you a template in a PNG, or PDF format. But I wanted to go a bit further, actually create a useful template in GIMP. That way, it puts guides on the page that can be used for content positioning.

I came up with a GIMP script in script-fu that asks the questions of book size and page count and generates a new document with the size and guides ready to go.

Save the script in the `~/config/GIMP/3.0/scripts` folder as `book-cover-template.scm`, restart GIMP and you should have a new option under the File \> Create Menu “Amazon Book Cover Template…”

```
(define (script-fu-book-cover-template binding-type interior-type paper-type page-count trim-size dpi)
  (let* (
    ; Trim size dimensions (width, height in inches)
    (trim-dimensions (cond
      ((= trim-size 0) (list 6 9))      ; 6 x 9 in
      ((= trim-size 1) (list 5.5 8.5))  ; 5.5 x 8.5 in
      ((= trim-size 2) (list 5.25 8))   ; 5.25 x 8 in
      ((= trim-size 3) (list 5 8))      ; 5 x 8 in
      ((= trim-size 4) (list 8 10))     ; 8 x 10 in
      ((= trim-size 5) (list 8.5 11))   ; 8.5 x 11 in
      (else (list 6 9))))               ; default

    (trim-width (car trim-dimensions))
    (trim-height (cadr trim-dimensions))

    ; Calculate spine width with proper paper specifications
    (spine-width (let* ((thickness-per-page
                          (cond
                            ; White paper calculations
                            ((= paper-type 0)
                              (if (= interior-type 0)
                                0.0025  ; Black & white on white paper (60# paper)
                                0.0057)) ; Color on white paper (70# paper for quality)
                            ; Cream paper calculations
                            (else 0.0025)))) ; Cream paper (55# paper)
                   (max 0.06 (* page-count thickness-per-page))))

    ; Cover dimensions
    (bleed 0.125)
    (margin 0.125)
    (cover-width-in (+ (* trim-width 2) spine-width (* bleed 2)))
    (cover-height-in (+ trim-height (* bleed 2)))

    ; Convert to pixels
    (width-px (round (* cover-width-in dpi)))
    (height-px (round (* cover-height-in dpi)))

    ; Guide positions in pixels
    (bleed-px (round (* bleed dpi)))
    (margin-px (round (* margin dpi)))
    (trim-width-px (round (* trim-width dpi)))
    (spine-width-px (round (* spine-width dpi)))

    ; Create image and layer
    (image (car (gimp-image-new width-px height-px RGB)))
    (layer (car (gimp-layer-new image "Background" width-px height-px RGB-IMAGE 100 0)))
    )

    ; Set up the image
    (gimp-image-undo-group-start image)
    (gimp-image-set-resolution image dpi dpi)
    (gimp-image-insert-layer image layer 0 0)
    (gimp-drawable-fill layer FILL-WHITE)

    ; Add vertical guides
    (gimp-image-add-vguide image bleed-px)  ; Left bleed
    (gimp-image-add-vguide image (+ bleed-px margin-px))  ; Left safe area (Back cover safe)
    (gimp-image-add-vguide image (- (+ bleed-px trim-width-px) margin-px))  ; Back cover right safe
    (gimp-image-add-vguide image (+ bleed-px trim-width-px))  ; Back|Spine boundary
    (gimp-image-add-vguide image (+ bleed-px trim-width-px spine-width-px))  ; Spine|Front boundary
    (gimp-image-add-vguide image (+ bleed-px trim-width-px spine-width-px margin-px))  ; Front cover left safe
    (gimp-image-add-vguide image (- width-px bleed-px margin-px))  ; Front cover right safe
    (gimp-image-add-vguide image (- width-px bleed-px))  ; Right bleed

    ; Add horizontal guides
    (gimp-image-add-hguide image bleed-px)  ; Top bleed
    (gimp-image-add-hguide image (+ bleed-px margin-px))  ; Top safe
    (gimp-image-add-hguide image (- height-px bleed-px margin-px))  ; Bottom safe
    (gimp-image-add-hguide image (- height-px bleed-px))  ; Bottom bleed

    ; Display the image
    (gimp-display-new image)

    ; Properly end undo group
    (gimp-image-undo-group-end image)

    ; Show success message
    (gimp-message (string-append "Book cover template created successfully!\n\n"
                                "Specifications:\n"
                                "Binding: " (list-ref (list "Paperback" "Hardcover") binding-type) "\n"
                                "Interior: " (list-ref (list "Black & white" "Color") interior-type) "\n"
                                "Paper: " (list-ref (list "White paper" "Cream paper") paper-type) "\n"
                                "Pages: " (number->string page-count) "\n"
                                "Trim: " (list-ref (list "6 x 9 in" "5.5 x 8.5 in" "5.25 x 8 in" "5 x 8 in" "8 x 10 in" "8.5 x 11 in") trim-size) "\n"
                                "Full Cover: " (number->string cover-width-in) " x " (number->string cover-height-in) " in\n"
                                "Spine: " (number->string spine-width) " in\n"
                                "DPI: " (number->string dpi)))

    image))

; Register the script
(script-fu-register
  "script-fu-book-cover-template"
  "Amazon Book Cover Template..."
  "Create a book cover template with guides for Amazon KDP"
  "BookCover"
  "BookCover"
  "2024"
  ""
  SF-OPTION     "Binding Type"    '("Paperback" "Hardcover")
  SF-OPTION     "Interior Type"   '("Black & white" "Color")
  SF-OPTION     "Paper Type"      '("White paper" "Cream paper")
  SF-ADJUSTMENT "Page Count"      '(100 24 9999 1 10 0 1)
  SF-OPTION     "Trim Size"       '("6 x 9 in" "5.5 x 8.5 in" "5.25 x 8 in" "5 x 8 in" "8 x 10 in" "8.5 x 11 in")
  SF-ADJUSTMENT "DPI"             '(300 72 1200 1 10 0 1))

; Add to menu
(script-fu-menu-register "script-fu-book-cover-template" "<Image>/File/Create")
```
