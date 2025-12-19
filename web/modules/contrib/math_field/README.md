# Math Field (Mathematical Expression Field Formatter)

## INTRODUCTION

A simple lexer and parser that can compute simple mathematical operations 
using the most basic operators `+, -, *, /` and can correctly handle 
parentheses `()` and floating point operations (decimal numbers).  
It can NOT currently handle negative numbers or unary operations.

It is implemented as a Drupal 8 service module and provides a text field 
formatter.

The formatter currently displays errors inline.

## REQUIREMENTS

* Drupal 8

## INSTALLATION

Download, install and enable as you normally install a Drupal 8 module 
hosted on drupal.org

```bash
composer require drupal/math_field
drush en math_field
```

## CONFIGURATION

After enabling the module create a `text field` in your content type and 
choose `Math field formatter` as a formatter at 
`admin/structure/types/manage/CONTENT_TYPE/display`

The formatter will display both the expression and the result (or error 
message).

```
(1 + 2) * 4  = 12
```

The result will be revealed on hover with a delayed css animation.
