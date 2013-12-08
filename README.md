delta Δ 
=====

Delta is a google chrome extension that helps you remember on the fly changes made to a dom element in googles developer console. 

To begin tracking your changes, click the delta icon. The red icon indicates delta is monitoring your changes. 

To stop, click the delta icon again. The black icon indicates delta is not currently monitoring your changes. 

Delta clears on page reload. 

Outputting CSS Changes
=====
To print css changes to a file, right click in the current page view, then under the delta menu, click "write css changes to file".

To copy css changes to the clipboard, right click in the current page view, go to the delta menu, and click "copy css changes to clipboard".

Caveats
=====
While I love mutation observers, I can only tell what the mutation is and not who is triggering it. Therefore, delta will pull in any dom style attribute manipulations- regardless of if its you in the dev console or
jquery/your favorite library working its mojo.