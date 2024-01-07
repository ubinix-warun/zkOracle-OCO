# This project demonstrates how to create documentation for OpenNautilus contracts using TSDoc and Antora.

* TSDoc: A documentation generator for TypeScript that extracts comments from code to create Markdown files.
* Antora: A modular static site generator designed for creating documentation from content in AsciiDoc or Markdown.

<img src="https://raw.githubusercontent.com/ubinix-warun/zkOracle-OCO/main/scripts/tsdoc-antora/Screenshot%202567-01-07%20at%2011.05.37.png" />

## Getting Started

### Build 
```bash
npm i -D -E @antora/cli@3.1 @antora/site-generator@3.1

npx antora --fetch antora-playbook.yml
[fetch] ...thub.com/zkoracle/opennautilus-contacts.git [##########################################
Site generation complete!
Open file:///Users/warun/HackathonProjects/zkOracle-OCO/scripts/tsdoc-antora/build/site in a browser to view your site.

```

## Demo 
```bash
cd build/site
python3 -m http.server             
Serving HTTP on :: port 8000 (http://[::]:8000/) ...

```

