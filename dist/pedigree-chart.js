(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3')) :
  typeof define === 'function' && define.amd ? define(['d3'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PedigreeChart = factory(global.d3));
})(this, (function (d3) { 'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

  class PedigreeChart {
    constructor(selector, data) {
      this.selector = selector;
      this.data = data;
      this.width = 1200;
      this.height = 800;
      this.initChart();
    }

    initChart() {
      this.svg = d3__namespace.select(this.selector)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);

      this.g = this.svg.append('g'); // group for zoom and pan
      this.addZoom();
    }

    draw() {
      const nodes = this.g.selectAll('.node')
        .data(this.data)
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('fill', 'white')
        // border
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .call(d3__namespace.drag()
          .on('start', (event, d) => this.dragstarted(event, d))
          .on('drag', (event, d) => this.dragged(event, d))
          .on('end', (event, d) => this.dragended(event, d)));

      // Draw circles for nodes
      nodes.append('circle')
        .attr('r', 30)
        .on('click', (event, d) => this.highlightNode(event, d));
        
          }

          dragstarted(event, d) {
            if (d3__namespace.select(event.sourceEvent.target).attr('fill') === 'orange') {
              d3__namespace.select(event.sourceEvent.target).raise().attr('stroke', 'black');
            }
          } 

          dragged(event, d) {
            if (d3__namespace.select(event.sourceEvent.target).attr('fill') === 'orange') {
              d3__namespace.select(event.sourceEvent.target)
                .attr('transform', `translate(${d.x = event.x}, ${d.y = event.y})`);
            }
          }
          
          dragended(event, d) {
            if (d3__namespace.select(event.sourceEvent.target).attr('fill') === 'orange') {
              d3__namespace.select(event.sourceEvent.target).attr('stroke', null);
            }
          }

    highlightNode(event, d) {
      d3__namespace.selectAll('circle').attr('fill', 'white'); // Reset all nodes
      d3__namespace.select(event.currentTarget).attr('fill', 'orange'); // Highlight selected node
    }

    addZoom() {
      const zoom = d3__namespace.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          this.g.attr('transform', event.transform);
        });

      this.svg.call(zoom);
    }
  }

  return PedigreeChart;

}));
