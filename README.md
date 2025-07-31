# Foldable Use Statements

A VS Code extension that adds code folding support for PHP `use` statements, helping you keep your imports organized and your code clean.

## Features

This extension automatically detects groups of consecutive PHP `use` statements and makes them foldable in VS Code. This helps reduce visual clutter when working with files that have many imports.

### What gets folded

The extension creates folding ranges for:
- **Multiple consecutive use statements** (2 or more)
- **Use statement groups separated only by comments or empty lines**

### What doesn't get folded

- **Single use statements** (no point in folding one line)
- **Use statements separated by actual code**

## Examples

### Basic folding
```php
<?php

use App\Models\User;          // ← This group will be foldable
use App\Models\Post;          // ←
use App\Models\Comment;       // ←
use App\Services\Logger;      // ←

class MyController {
    // ...
}
```

### Comments between use statements
```php
<?php

use App\Models\User;          // ← This entire group will be foldable
use App\Models\Post;          // ← including the commented line
// use App\Models\Comment;    // ← (comments don't break the group)
use App\Services\Logger;      // ←

class MyController {
    // ...
}
```

### Multiple separate groups
```php
<?php

use App\Models\User;          // ← First foldable group
use App\Models\Post;          // ←

class MyController {
    public function index() {
        use App\Services\Cache;   // ← Second foldable group
        use App\Services\Logger;  // ← (even inside methods)
        
        // ...
    }
}
```

## How to use

1. Install the extension
2. Open any PHP file with multiple `use` statements
3. Look for the folding arrows (▼) next to groups of use statements
4. Click the arrow or use `Ctrl+Shift+[` / `Ctrl+Shift+]` to fold/unfold

## Requirements

- VS Code 1.99.0 or higher
- PHP files (`.php` extension)

## Extension Settings

This extension doesn't add any configurable settings. It works automatically for all PHP files.

## Known Issues

None currently known. If you find any issues, please report them on the GitHub repository.

## Support This Extension

If you find this extension useful, consider supporting its development:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/alextf)

Your support helps maintain and improve this extension!

## Release Notes

### 0.0.1

Initial release featuring:
- Automatic detection of PHP use statement groups
- Smart folding that ignores comments and empty lines
- Support for use statements with aliases (`use Foo as Bar`)
- Robust parsing that avoids false positives

---

**Enjoy cleaner PHP code with foldable use statements!**
