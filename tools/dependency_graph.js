#!/usr/bin/env node

// VexFlow does NOT include the necessary dependencies. To run this script, install the following:
//   npm i -g dependency-cruiser
//   npm i -g graphviz-cli

// Set the NODE_PATH environment variable to point to your global node_modules directory.
// Run this script from the vexflow/ directory:
//   NODE_PATH=/usr/local/lib/node_modules/ ./tools/dependency_graph.js

// If your global node_modules folder is /usr/local/lib/node_modules/
// You can skip setting the NODE_PATH, because we do so in the line below:
module.paths.push('/usr/local/lib/node_modules/');
// Just run the script with no arguments, and we will output the graphs to the vexflow/graphs/ directory.
//   ./tools/dependency_graph.js

const fs = require('fs');
const { cruise } = require('dependency-cruiser');
const { renderGraphFromSource } = require('graphviz-cli');

fs.mkdirSync('graphs', { recursive: true });

function generateGraphForFolder(folderName, excludePattern, collapsePattern = undefined) {
  try {
    const options = {
      outputType: 'dot',
      exclude: { path: excludePattern },
    };
    if (collapsePattern) {
      options.collapse = collapsePattern;
    }
    const cruiseResult = cruise([folderName], options);
    renderGraphFromSource({ input: cruiseResult.output }, { format: 'svg' }).then((svg) => {
      const svgWithLinks = svg.replace(
        /xlink:href="(.*?)"/g,
        `href="https://github.com/0xfe/vexflow/tree/master/$1" target="_blank"`
      );
      const htmlOutput = getHTMLOutput(`VexFlow ${folderName}/`, svgWithLinks);
      fs.writeFileSync(`graphs/${folderName}.html`, htmlOutput);
    });
  } catch (error) {
    console.error(error);
  }
}

function getHTMLOutput(title, svg) {
  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      .node:active path,
      .node:hover path,
      .node.current path,
      .node:active polygon,
      .node:hover polygon,
      .node.current polygon {
        stroke: fuchsia;
        stroke-width: 2;
      }
      .edge:active path,
      .edge:hover path,
      .edge.current path,
      .edge:active ellipse,
      .edge:hover ellipse,
      .edge.current ellipse {
        stroke: fuchsia;
        stroke-width: 3;
        stroke-opacity: 1;
      }
      .edge:active polygon,
      .edge:hover polygon,
      .edge.current polygon {
        stroke: fuchsia;
        stroke-width: 3;
        fill: fuchsia;
        stroke-opacity: 1;
        fill-opacity: 1;
      }
      .edge:active text,
      .edge:hover text {
        fill: fuchsia;
      }
      .cluster path {
        stroke-width: 3;
      }
      .cluster:active path,
      .cluster:hover path {
        fill: #ffff0011;
      }
    </style>
  </head>
  <body>
    ${svg}
    <script>
      document.body.onmouseover = getHighlightHandler();
      document.body.onclick = getClickHandler();

      function getHighlightHandler() {
        /** @type {string} */
        var currentHighlightedTitle;

        /** @type {NodeListOf<SVGGElement>} */
        var nodes = document.querySelectorAll('.node');
        /** @type {NodeListOf<SVGGElement>} */
        var edges = document.querySelectorAll('.edge');
        var title2ElementMap = new Title2ElementMap(edges, nodes);

        /** @param {MouseEvent} pMouseEvent */
        return function highlightHandler(pMouseEvent) {
          var closestNodeOrEdge = pMouseEvent.target.closest('.edge, .node');
          var closestTitleText = getTitleText(closestNodeOrEdge);

          if (!(currentHighlightedTitle === closestTitleText)) {
            title2ElementMap.get(currentHighlightedTitle).forEach(removeHighlight);
            title2ElementMap.get(closestTitleText).forEach(addHighlight);
            currentHighlightedTitle = closestTitleText;
          }
        };
      }

      function getClickHandler() {
        return function highlightHandler(pMouseEvent) {
          var closestNodeOrEdge = pMouseEvent.target.closest('.edge, .node');
          console.log('Clicked', closestNodeOrEdge);
        };
      }

      /**
       *
       * @param {SVGGelement[]} pEdges
       * @param {SVGGElement[]} pNodes
       * @return {{get: (pTitleText:string) => SVGGElement[]}}
       */
      function Title2ElementMap(pEdges, pNodes) {
        /* {{[key: string]: SVGGElement[]}} */
        var elementMap = buildMap(pEdges, pNodes);

        /**
         * @param {NodeListOf<SVGGElement>} pEdges
         * @param {NodeListOf<SVGGElement>} pNodes
         * @return {{[key: string]: SVGGElement[]}}
         */
        function buildMap(pEdges, pNodes) {
          var title2NodeMap = buildTitle2NodeMap(pNodes);

          return nodeListToArray(pEdges).reduce(addEdgeToMap(title2NodeMap), {});
        }
        /**
         * @param {NodeListOf<SVGGElement>} pNodes
         * @return {{[key: string]: SVGGElement}}
         */
        function buildTitle2NodeMap(pNodes) {
          return nodeListToArray(pNodes).reduce(addNodeToMap, {});
        }

        function addNodeToMap(pMap, pNode) {
          var titleText = getTitleText(pNode);

          if (titleText) {
            pMap[titleText] = pNode;
          }
          return pMap;
        }

        function addEdgeToMap(pNodeMap) {
          return function (pEdgeMap, pEdge) {
            /** @type {string} */
            var titleText = getTitleText(pEdge);

            if (titleText) {
              var edge = pryEdgeFromTitle(titleText);

              pEdgeMap[titleText] = [pNodeMap[edge.from], pNodeMap[edge.to]];
              (pEdgeMap[edge.from] || (pEdgeMap[edge.from] = [])).push(pEdge);
              (pEdgeMap[edge.to] || (pEdgeMap[edge.to] = [])).push(pEdge);
            }
            return pEdgeMap;
          };
        }

        /**
         *
         * @param {string} pString
         * @return {{from?: string; to?:string;}}
         */
        function pryEdgeFromTitle(pString) {
          var nodeNames = pString.split(/\s*->\s*/);

          return {
            from: nodeNames.shift(),
            to: nodeNames.shift(),
          };
        }
        /**
         *
         * @param {string} pTitleText
         * @return {SVGGElement[]}
         */
        function get(pTitleText) {
          return (pTitleText && elementMap[pTitleText]) || [];
        }
        return {
          get: get,
        };
      }

      /**
       * @param {SVGGElement} pGElement
       * @return {string?}
       */
      function getTitleText(pGElement) {
        /** @type {SVGTitleElement} */
        var title = pGElement && pGElement.querySelector('title');
        /** @type {string} */
        var titleText = title && title.textContent;

        if (titleText) {
          titleText = titleText.trim();
        }
        return titleText;
      }

      /**
       * @param {NodeListOf<Element>} pNodeList
       * @return {Element[]}
       */
      function nodeListToArray(pNodeList) {
        var lReturnValue = [];

        pNodeList.forEach(function (pElement) {
          lReturnValue.push(pElement);
        });

        return lReturnValue;
      }

      /**
       * @param {SVGGElement} pGElement
       */
      function removeHighlight(pGElement) {
        if (pGElement && pGElement.classList) {
          pGElement.classList.remove('current');
        }
      }

      /**
       * @param {SVGGElement} pGroup
       */
      function addHighlight(pGroup) {
        if (pGroup && pGroup.classList) {
          pGroup.classList.add('current');
        }
      }
    </script>
  </body>
</html>
`;
}

const IGNORE = '(index|vex|flow|util|tables|typeguard|version).ts';

generateGraphForFolder('src', IGNORE);
generateGraphForFolder('entry', IGNORE);
generateGraphForFolder('tests', `(formatter|support|types|${IGNORE})`, '^src/');
