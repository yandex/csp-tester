# CSP Tester

This extension helps web masters to test web application functionality
with [Content Security Policy (CSP)](https://www.w3.org/TR/CSP2/) version 2.0 implemented.

![](https://oxdef.info/downloads/csp-tester_2.0.png "CSP Tester screenshot")

You can install CSP Tester from [Chrome Web Store](https://chrome.google.com/webstore/detail/csp-tester/ehmipebdmhlmikaopdfoinmcjhhfadlf)

Typical workflow looks like:

1. Open the extension window
2. Add into the URL Pattern a regular expression for the site that you want to test, for example `*://yoursite.com/*` (CSP Tester uses [Chrome Match Patterns](https://developer.chrome.com/extensions/match_patterns))
3. Tick the e.g. "self" checkbox, check "Active" and Save the changes
4. Open the Developer Tools and navigate to the tested site
5. Confirm a number of CSP violations reported in the Developer Tools Console as well as possible visual changes
6. Make changes in the policy based on these reports

To analyze CSP logs you can use [CSP Reporter](https://oxdef.info/csp-reporter)
