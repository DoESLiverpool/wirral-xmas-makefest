# Custom pen-plotted maps for Wirral Xmas Makefest

A shonky script for converting a given placename into a map suitable for plotting on [McGraw the DoES Liverpool pen plotter](https://github.com/DoESLiverpool/mcgraw).

Much of this code is taken from (and/or inspired by) https://github.com/blinry/letterplotter.

## How to use this

You will need:

- [Git](https://git-scm.com/)
- [Python 3](https://www.python.org)
- [Node.js](https://nodejs.org/en)

Clone this repo to your machine, and install the required packages:

    git clone https://github.com/DoESLiverpool/wirral-xmas-makefest.git
    cd wirral-xmas-makefest
    npm install

Generate an SVG for a the location you’re interested in:

    script/get-svg-map.js --place "68 Kempston Street, L3 8HL"

You can then take the generated SVG (`68-kempston-street-l3-8hl.svg` in the example above), and incorporate it into artwork in Illustrator or Inkscape.

You will likely want to consult https://github.com/DoESLiverpool/mcgraw for instructions on how to export G-Code from Inkscape and convert it into a flavour of G-Code that McGraw understands.
