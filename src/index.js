import './style.css';
import * as d3 from 'd3';


// Write Javascript code!
const appDiv = document.getElementById('app');
let stocks;

// set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 70, left: 60 },
  width = 700 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select('#my_dataviz')
  .append('svg')
  .attr('width', 251 * 20 + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

d3.csv(
  'https://gist.githubusercontent.com/ipast44/25755df18f84e74fb2e06913cd67600d/raw/90190ff670a906a5b326efdf93c3c776b145e311/data.csv',
  function (d) {
    return {
      sec: d.date,
      date: d3.timeParse('%s')(d.date ?? '0') ?? new Date(),
      value: d.value ?? '',
      volume: d.volume ?? '',
    };
  }
).then(function (data) {
  stocks = data;

  // X axis
  const x = d3
    .scaleBand()
    .domain(
      data.map(d => d.date)
    )
    .range([ 0, data.length * 20]);


  // .domain(data.map((d) => d.Time || '').filter((_, i) => i % 6 === 0))
  // svg
  //   .append('g')
  //   .attr('transform', `translate(0, ${height})`)
  //   .call(d3.axisBottom(x))
  //   .selectAll('text')
  //   .attr('transform', 'translate(-10,0)rotate(-45)')
  //   .style('text-anchor', 'end');

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 40]).range([height, 0]);

  const z = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.volume;
      }),
    ])
    .range([height, 0]);
  svg.append('g').call(d3.axisLeft(y));

  let tooltip = d3
    .select('#my_dataviz')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .text("I'm a circle!");

  // Bars
  svg
    .selectAll('mybar')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(d.date) ?? '')
    .attr('y', (d) => y(d.value))
    .attr('id', (d) => d.sec)
    .attr('class', 'bars')
    .attr('width', '10px')
    .attr('height', (d) => height - y(d.value))
    .attr('fill', 'orange')
    .on('mouseover', function (da) {
      console.log(da.srcElement.id);
      const text = stocks.find((el) => (el.sec === da.srcElement.id));
      console.log(text);
      return tooltip
        .style('visibility', 'visible')
        .text(`${text.value}\n${text.volume}\n${text.date.toLocaleDateString()}`);
    })
    .on('mousemove', function () {
      return tooltip
        .style('top', event.pageY - 100 + 'px')
        .style('left', event.pageX - 100 + 'px');
    })
    .on('mouseout', function () {
      return tooltip.style('visibility', 'hidden');
    });

  // curve
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
    .attr(
      'd',
      d3
        .line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return z(d.volume);
        })
    );

    var zoom = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(x)
      .on('zoom', function() {
        svg.select('.data').attr('d', line)
      });

    svg.call(zoom);
});
