const draw = async (el, scale) => {
  const dataset = await d3.json('data.json');
  dataset.sort((a, b) => a - b);

  const dimensions = {
    width: 600,
    height: 150,
  };

  const box = dimensions.width / 20;

  const svg = d3.select(el)
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  let colorScale;

  if (scale === 'linear') {
    colorScale = d3.scaleLinear()
      .domain(d3.extent(dataset))
      .range(['white', 'red']);
  } else if (scale === 'quantize') {
    colorScale = d3.scaleQuantize()
      .domain(d3.extent(dataset))
      .range(['white', 'pink', 'red']);
  } else if (scale === 'quantile') {
    colorScale = d3.scaleQuantile()
      .domain(dataset)
      .range(['white', 'pink', 'red']);
  } else if (scale === 'threshold') {
    colorScale = d3.scaleThreshold()
      .domain([45200, 135600])
      .range(['white', 'pink', 'red']);
  }

  svg.append('g')
    .attr('transform', 'translate(2, 2)')
    .attr('stroke', 'black')
    .selectAll('rect')
    .data(dataset)
    .join('rect')
    .attr('width', box - 3)
    .attr('height', box - 3)
    .attr('x', (_, i) => box * (i % 20))
    .attr('y', (_, i) => box * ((i / 20) | 0)) // Get the integer part
    .attr('fill', (d) => colorScale(d))

  
};

draw('#heatmap1', 'linear');

draw('#heatmap2', 'quantize');

draw('#heatmap3', 'quantile');

draw('#heatmap4', 'threshold');