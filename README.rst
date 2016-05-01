===========
CSP Tester
===========

This extension helps web masters to test web application behaviour 
with Content Security Policy (CSP_) version 2.0 implemented.

.. figure:: https://oxdef.info/downloads/csp-tester.png
  
  CSP Tester screenshot
  
You can install CSP Tester from `Chrome Web Store`_

To verify functionality of CSP Tester:

#. Open the extension window
#. Add into the URL Pattern a regular expression for the site that you want to test, for example ``*://*.eff.org/*``  (CSP Tester uses `Chrome Match Patterns <https://developer.chrome.com/extensions/match_patterns>`_)
#. Tick the "self" checkbox, check "Active" and Save the changes
#. Open the Developer Tools, navigate to the tested site such as http://eff.org
#. Confirm a number of CSP violations reported in the Developer Tools Console as well as possible visual changes

To analyze CSP logs you can use `CSP Reporter <https://oxdef.info/csp-reporter>`__

.. _CSP: http://www.w3.org/TR/CSP2/
.. _Download: https://github.com/oxdef/csp-tester/archive/master.zip
.. _Chrome Web Store: https://chrome.google.com/webstore/detail/csp-tester/ehmipebdmhlmikaopdfoinmcjhhfadlf
