# Libraries Provider Fontawesome

Libraries Provider Fontawesome is just a library definition
for the [Fontawesome library](https://github.com/FortAwesome/Font-Awesome/)
with the extra information needed to be configured by
[Libraries provider](https://www.drupal.org/project/libraries_provider).

By default it will load the Fontawesome library from the
[jsdelivr CDN](https://www.jsdelivr.com/).

Note that libraries provider is not a required module since
the definition of the library works out of the box.
Install libraries provider when you need to change some of the defaults
this module provides, for example, override the version or load the assets
from the local filesystem.

## Installation

It is recommended to install this module using composer.

```
composer require drupal/lp_fontawesome:^6
```

## Versioning

This module follows the fontawesome version but with the minor
multiplied by 10. For example the version 6.7.20 of this module corresponds
with the 6.7.2 version of fontawesome.
This allow for this module to release minor versions
that do not change the upstream version.

## Notes

This project started as a way to use icons on the
[Drulma theme](https://www.drupal.org/project/drulma)
since it is the default icon set used by that project.
