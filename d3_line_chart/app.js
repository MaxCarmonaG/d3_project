async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  const parseDate = d3.timeParse('%Y-%m-%d');

  const xAccessor = d => parseDate(d.date);
  const yAccessor = d => parseInt(d.close);

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g") // <g>
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  const tooltip = d3.select('#tooltip');
  const tooltipDot = ctr.append('circle')
    .attr('r', 5)
    .attr('fill', '#fc8781')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .style('pointer-events', 'none');

  // Scales
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.ctrHeight, 0])
    .nice();

  const xScale = d3.scaleUtc()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.ctrWidth]);

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  ctr.append('path')
    .datum(dataset)
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', '#30475e')
    .attr('stroke-width', 2)


  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => '$' + d);

  ctr.append('g').call(yAxis);

  const xAxis = d3.axisBottom(xScale);

  ctr.append('g')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .call(xAxis);

  ctr.append('rect')
    .attr('width', dimensions.ctrWidth)
    .attr('height', dimensions.ctrHeight)
    .style('opacity', 0)
    .on('touchmouse mousemove', function(event) {
      const mousePos = d3.pointer(event, this);
      const date = xScale.invert(mousePos[0]);
      
      // Custom Bisector - left, center, right
      const bisector = d3.bisector(xAccessor).left;
      
      const index = bisector(dataset, date);
      const stock = dataset[index - 1];

      // Update image
      tooltipDot.style('opacity', 1)
        .attr('cx', xScale(xAccessor(stock)))
        .attr('cy', yScale(yAccessor(stock)))
        .raise();

      tooltip.style('display', 'block')
        .style('top', yScale(yAccessor(stock)) - 20 + 'px')
        .style('left', xScale(xAccessor(stock)) + 'px');

      tooltip.select('.price')
        .text(`$${yAccessor(stock)}`);

      const dateFormatter = d3.timeFormat('%B %-d, %Y');

      tooltip.select('.date')
        .text(dateFormatter(xAccessor(stock)));
      
    })
    .on('mouseleave' , function (event) {
      tooltipDot.style('opacity', 0);

      tooltip.style('display', 'none');
    })
}

draw()