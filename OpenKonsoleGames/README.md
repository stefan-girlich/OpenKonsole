= OpenKonsoleGames =

This directory contains games for the OpenKonsole system. Each directory contains one game including all required resources except for the provided dependencies mentioned below. The name of the directory is the name of the game used by any technological means such as loading.


== Restrictions and provides APIs ==

* Currently, the entire HTML and Node contexts are visible from within the game's JavaScript context  without any restriction.
* A game should use local resources from within the directory. Using remote resources is not supported.
* The latest stable three.js version is provided.
* The latest stable jQuery version is provided.
* The OpenKonsole player API is provided.
* The engine's HTML, CSS and JavaScript capabilities are those provided by the node-webkit version used. If you're unsure about a particular feature, use feature detection and polyfills.


