import * as d3 from 'd3';

export default class PedigreeChart {
  constructor(selector, data) {
    this.selector = selector;
    this.data = data;
    this.width = 1200;
    this.height = 800;
    this.initChart();
  }

  initChart() {
    this.svg = d3.select(this.selector)
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
      .call(d3.drag()
        .on('start', (event, d) => this.dragstarted(event, d))
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', (event, d) => this.dragended(event, d)));

    // Draw circles for nodes
    nodes.append('circle')
      .attr('r', 30)
      .on('click', (event, d) => this.highlightNode(event, d))
      
        }

        dragstarted(event, d) {
          if (d3.select(event.sourceEvent.target).attr('fill') === 'orange') {
            d3.select(event.sourceEvent.target).raise().attr('stroke', 'black');
          }
        } 

        dragged(event, d) {
          if (d3.select(event.sourceEvent.target).attr('fill') === 'orange') {
            d3.select(event.sourceEvent.target)
              .attr('transform', `translate(${d.x = event.x}, ${d.y = event.y})`);
          }
        }
        
        dragended(event, d) {
          if (d3.select(event.sourceEvent.target).attr('fill') === 'orange') {
            d3.select(event.sourceEvent.target).attr('stroke', null);
          }
        }

  highlightNode(event, d) {
    d3.selectAll('circle').attr('fill', 'white'); // Reset all nodes
    d3.select(event.currentTarget).attr('fill', 'orange'); // Highlight selected node
  }

  addZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);
  }
}
